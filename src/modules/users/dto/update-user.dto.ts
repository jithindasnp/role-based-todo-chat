import { IsOptional, IsString, IsEmail, IsEnum } from 'class-validator';
import { Department } from '../../departments/departments.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(['admin', 'manager', 'employee'])
  role?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;

  @IsOptional()
  department?: Department;
} 