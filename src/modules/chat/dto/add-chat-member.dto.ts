import { IsUUID, IsArray } from 'class-validator';

export class AddChatMemberDto {
  @IsUUID()
  chatId: string;

  @IsArray()
  @IsUUID('all', { each: true })
  memberIds: string[];
}
