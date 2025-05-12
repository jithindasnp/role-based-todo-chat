export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  department_id: number;
  role: 'admin' | 'manager' | 'employee';
} 