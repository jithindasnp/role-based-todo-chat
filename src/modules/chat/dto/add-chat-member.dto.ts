import { IsUUID, IsArray, ArrayMinSize } from 'class-validator';

export class AddChatMemberDto {
  @IsUUID()
  chatId: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('all', { each: true })
  memberIds: string[];
}
