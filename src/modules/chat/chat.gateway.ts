import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server } from 'socket.io';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WsJwtGuard } from 'src/guards/ws-jwt.guard';
import { CreateMessageDto } from './dto/create-message.dto';
import { AuthService } from '../auth/auth.service';
import { CreateChatDto } from './dto/create-chat.dto';

@WebSocketGateway({
  cors: {
    origin: process.env.SOCKET_ORIGIN,
    methods: process.env.SOCKET_METHODS,
    credentials: true
  }
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatService,
    private authService: AuthService, // For token validation
  ) {}

  // Explicit connection handler
  async handleConnection(client: Socket) {
    try {
      // Extract token from multiple sources
      const token = 
        client.handshake.auth.token || 
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new Error('No token provided');
      }

      // Validate token
      const user = await this.authService.validateToken(token);
      
      // Store user in socket session
      client.data.user = user;

      console.log(`User ${user.id} connected`);
    } catch (error) {
      console.error('Connection error:', error);
      
      // Disconnect with specific error
      client.emit('connection_error', { 
        message: error.message 
      });
      client.disconnect(true);
    }
  }

  // Create a new chat
  @SubscribeMessage('create_chat')
  async createChat(
    @MessageBody() data: CreateChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Get user from socket session
      const creator = client.data.user;

      // Ensure memberIds is an array
      if (!Array.isArray(data.memberIds)) {
        data.memberIds = [data.memberIds].filter(Boolean);
      }

      // Validate input
      if (data.type === 'direct' && data.memberIds.length !== 1) {
        throw new Error('Direct chat must have exactly one other participant');
      }

      // Create chat via service
      const newChat = await this.chatService.createChat(
        data, 
        creator.id
      );

      // Notify participants
      data.memberIds.forEach(memberId => {
        const memberSocket = this.findSocketByUserId(memberId);
        if (memberSocket) {
          memberSocket.emit('new_chat_created', newChat);
        }
      });

      // Confirm to creator
      client.emit('chat_created', newChat);

      return newChat;
    } catch (error) {
      console.log("Chat creation error:", error);
      
      client.emit('chat_creation_error', {
        success: false,
        message: error.message,
        // Additional error details
      });  
    }
  }

  // Helper to find user's socket (simplified)
  private findSocketByUserId(userId: string): Socket | null { 
    // In a real app, implement a proper socket mapping
    for (const [id, socket] of this.server.sockets.sockets) {
      if (socket.data.user?.id === userId) {
        return socket;
      }
    }
    return null;
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() data: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.chatService.saveMessage(data); 
    this.server.to(data.chatId).emit('receive_message', message);
  }


  @SubscribeMessage('join_chat')
  async handleJoinChat(
    @MessageBody() chatId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    const isMember = await this.chatService.isChatMember(chatId, user.id);
    if (!isMember) {
      throw new UnauthorizedException('You are not a member of this chat');
    }
    client.join(chatId);

    const chatHistory = await this.chatService.getChatHistory(chatId);
    client.emit('chat_history', chatHistory);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('fetch_chat_history')
  async handleFetchChatHistory(
    @MessageBody() chatId: string,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user = client.data.user;

      // Check if the user is a member of the chat
      const isMember = await this.chatService.isChatMember(chatId, user.id);
      if (!isMember) {
        throw new UnauthorizedException('You are not a member of this chat');
      }

      // Fetch chat history from the service
      const chatHistory = await this.chatService.getChatHistory(chatId);

      // Send the chat history to the user
      client.emit('chat_history', chatHistory);
    } catch (error) {
      client.emit('chat_history_error', {
        success: false,
        message: error.message,
      });
    }
  }
}
