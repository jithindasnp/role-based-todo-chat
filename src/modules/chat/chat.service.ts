import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Message } from './entities/message.entity';
import { Chat } from './entities/chat.entity';
import { ChatMember } from './entities/chat-member.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { User } from '../users/users.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepo: Repository<Chat>,

    @InjectRepository(ChatMember)
    private chatMemberRepo: Repository<ChatMember>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
  ) {}

  async createChat(
    createChatDto: CreateChatDto,
    creatorId: string,
  ): Promise<Chat> {
    try {
      // Validate input types
      if (!createChatDto || !creatorId) {
        throw new BadRequestException('Invalid input data');
      }

      // Validate chat type
      const validTypes = ['direct', 'group'] as const;
      if (!validTypes.includes(createChatDto.type)) {
        throw new BadRequestException(
          `Invalid chat type. Must be one of: ${validTypes.join(', ')}`,
        );
      }

      // Ensure memberIds is an array and remove any falsy values
      const memberIds = Array.isArray(createChatDto.memberIds)
        ? createChatDto.memberIds.filter(Boolean)
        : [createChatDto.memberIds].filter(Boolean);

      // Validate direct chat participant count
      if (createChatDto.type === 'direct' && memberIds.length !== 1) {
        throw new BadRequestException(
          'Direct chat must have exactly one participant',
        );
      }

      // Validate group chat name
      if (createChatDto.type === 'group' && !createChatDto.name) {
        throw new BadRequestException('Group chat must have a name');
      }

      // Combine and deduplicate participant IDs
      const allParticipantIds = [...new Set([...memberIds, creatorId])];

      // Validate participants
      const users = await this.validateParticipants(
        allParticipantIds,
        creatorId,
      );

      // Check role compatibility
      this.validateRoleCompatibility(users);

      // Check if chat already exists
      if (createChatDto.type === 'direct') {
        // For direct chats, check if a chat already exists between the creator and the participant
        const existingDirectChat = await this.chatRepo
          .createQueryBuilder('chat')
          .innerJoin('chat.members', 'member')
          .where('member.user_id IN (:...user_ids)', {
            user_ids: allParticipantIds,
          })
          .andWhere('chat.created_by = :creator_id', { creator_id: creatorId })
          .andWhere('chat.type = :type', { type: 'direct' })
          .groupBy('chat.id')
          .having('COUNT(chat.id) = :count', {
            count: allParticipantIds.length,
          })
          .getOne();

        if (existingDirectChat) {
          throw new BadRequestException('Direct chat already exists');
        }
      } else if (createChatDto.type === 'group' && createChatDto.name) {
        // For group chats, check if a chat with the same name already exists
        const existingGroupChat = await this.chatRepo.findOne({
          where: { name: createChatDto.name, type: 'group' },
        });

        if (existingGroupChat) {
          throw new BadRequestException(
            'Group chat with this name already exists',
          );
        }
      }

      // Save chat within a transaction
      const savedChat = await this.chatRepo.manager.transaction(
        async (transactionalEntityManager) => {
          const chatData = {
            type: createChatDto.type,
            name: createChatDto.name ?? '',
            created_by: creatorId,
            isdeleted: false,
            created_at: new Date(),
            members: [],
            messages: [],
          };

          const newChat = await transactionalEntityManager.save(Chat, chatData);

          const chatMembers = users.map((user) =>
            transactionalEntityManager.create(ChatMember, {
              chat: newChat,
              user: user,
            }),
          );

          await transactionalEntityManager.save(ChatMember, chatMembers);

          // Use non-null assertion or throw error if not found
          const foundChat = await transactionalEntityManager.findOne(Chat, {
            where: { id: newChat.id },
            relations: ['members', 'messages'],
          });

          if (!foundChat) {
            throw new NotFoundException('Created chat not found');
          }

          return foundChat;
        },
      );

      return savedChat;
    } catch (error) {
      console.error('Chat creation error:', error);
      throw error;
    }
  }

  async saveMessage(message: CreateMessageDto): Promise<Message> {
    const { chatId, senderId, receiverId, content } = message;
    const chat = await this.chatRepo.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    const sender = await this.userRepo.findOne({ where: { id: senderId } });
    if (!sender) {
      throw new NotFoundException('Sender not found');
    }
    const receiver = await this.userRepo.findOne({ where: { id: receiverId } });
    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }
    const messageEntity = this.messageRepo.create({
      chat,
      sender,
      receiver, 
      content,
    });
    
    return this.messageRepo.save(messageEntity) ;
  }

  private async validateParticipants(
    participantIds: string[],
    creatorId: string,
  ): Promise<User[]> {
    // Validate input
    if (!participantIds || participantIds.length === 0) {
      throw new BadRequestException('No participants provided');
    }

    // Fetch users
    const users = await this.userRepo.findBy({
      id: In(participantIds),
    });

    // Check if all participants exist
    if (users.length !== participantIds.length) {
      const foundUserIds = users.map((user) => user.id);
      const missingUserIds = participantIds.filter(
        (id) => !foundUserIds.includes(id),
      );

      throw new BadRequestException(
        `Users not found: ${missingUserIds.join(', ')}`,
      );
    }

    return users;
  }

  private validateRoleCompatibility(users: User[]) {
    // Get unique roles
    const roles = [...new Set(users.map((user) => user.role))];

    // Ensure all participants have the same role
    if (roles.length > 1) {
      throw new BadRequestException('Participants must have the same role');
    }
  }

  async getUsersByRole(role: string): Promise<{ id: string }[]> {
    return this.userRepo.find({ where: { role } });
  }

  async isChatMember(chatId: string, userId: string): Promise<boolean> {
    const member = await this.chatMemberRepo.findOne({
      where: { chat: { id: chatId }, user: { id: userId } },
    });
    return !!member;
  }

  async getChatHistory(chatId: string): Promise<Message[]> {
    return this.messageRepo.find({
      where: { chat: { id: chatId } },
      relations: ['sender'],
      order: { sent_at: 'ASC' },
    });
  }
}
