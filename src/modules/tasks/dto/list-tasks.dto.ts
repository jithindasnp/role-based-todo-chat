import { IsOptional, IsNumber, IsString, IsDateString, IsEnum } from 'class-validator';

export class ListTasksDto {
  
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: string;

  @IsOptional()
  @IsEnum(['pending', 'completed', 'reopened'])
  status?: string;

  @IsOptional()
  @IsDateString()
  due_date?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
} 