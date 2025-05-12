import { IsNotEmpty, IsString, Min, MinLength } from 'class-validator';

export class CreateDepartmentDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name: string;
}
