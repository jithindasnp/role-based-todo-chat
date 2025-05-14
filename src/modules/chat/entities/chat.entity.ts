import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChatMember } from "./chat-member.entity";
import { Message } from "./message.entity";

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ 
    type: 'enum', 
    enum: ['direct', 'group'], 
    default: 'direct' 
  })
  type: 'direct' | 'group';

  @Column({ 
    nullable: true, 
    length: 255 
  })
  name: string;

  @Column()
  created_by: string;

  @Column({ 
    default: false 
  })
  isdeleted: boolean;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => ChatMember, (member) => member.chat)
  members: ChatMember[];

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
}
