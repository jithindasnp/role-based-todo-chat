import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { ChatsService } from './chats.service';
// import { ChatsController } from './chats.controller';
import { Chat } from './chats.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chat])],
//   controllers: [ChatsController],
//   providers: [ChatsService],
//   exports: [ChatsService],
})
export class ChatsModule {}