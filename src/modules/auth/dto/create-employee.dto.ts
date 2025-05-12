import { CreateUserDto } from './create-user.dto';

export class CreateUserEmployeeDto extends CreateUserDto {
  manager_id: string;
} 