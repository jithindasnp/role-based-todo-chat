import { IsEnum, IsNotEmpty, IsOptional, IsUUID, IsArray, ArrayMinSize, IsString, ValidateIf } from 'class-validator';

export class CreateChatDto {
  @IsEnum(['direct', 'group'])
  type: 'direct' | 'group';

  @IsOptional()
  @IsNotEmpty()
  @ValidateIf(o => o.type === 'group')
  @IsString()
  name?: string;

  @IsUUID()
  created_by: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID("all", { each: true })
  memberIds: string[];  
}
