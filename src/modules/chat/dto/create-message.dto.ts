import { IsUUID, IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsUUID()
  @IsNotEmpty()
  chatId: string;

  @IsUUID()
  @IsNotEmpty()
  senderId: string;

  @IsUUID()
  @IsNotEmpty()
  receiverId: string;

  @IsNotEmpty()
  @IsString()
  @IsNotEmpty()
  content: string;
}
