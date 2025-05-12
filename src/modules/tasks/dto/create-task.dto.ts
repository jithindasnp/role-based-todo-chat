import { IsString, IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDateString()
  due_date: Date;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: string;

  @IsOptional()
  @IsEnum(['pending', 'completed', 'reopened'])
  status?: string;

  @IsUUID()
  assignedTo: string; 

  @IsUUID()
  createdBy: string; 
}
