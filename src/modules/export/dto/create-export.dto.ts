import { IsString, IsEnum, IsArray } from 'class-validator';
import { Task } from '../../tasks/entities/task.entity';

export class CreateExportDto {
  @IsArray()
  data: any[]; // Can be tasks, users, etc.

  @IsEnum(['pdf', 'excel'])
  type: 'pdf' | 'excel';

  @IsString()
  @IsEnum(['tasks', 'users', 'other'])
  entity: string;
}
