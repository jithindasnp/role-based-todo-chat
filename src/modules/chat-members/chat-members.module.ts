import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { ChatMembersService } from './chat-members.service';
// import { ChatMembersController } from './chat-members.controller';
import { ChatMember } from './chat-members.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMember])],
//   controllers: [ChatMembersController],
//   providers: [ChatMembersService],
//   exports: [ChatMembersService],
})
export class ChatMembersModule {}