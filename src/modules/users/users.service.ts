import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { EmployeeManagers } from '../employee-manager/entities/employee-managers.entity';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Not } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(EmployeeManagers)
    private readonly employeeManagerRepository: Repository<EmployeeManagers>,
    private readonly authService: AuthService,
  ) {}

  async listAllWithRoleFilterWithPagination(
    role: string,
    page: number,
    limit: number,
  ) {
    const whereCondition =
      role === 'all' ? { isdeleted: false } : { role, isdeleted: false };

    const [users, total] = await this.userRepository.findAndCount({
      where: whereCondition,
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      total,
      totalPages,
      currentPage: page,
    };
  }

  async userDetails(id: string) {
    const user = await this.userRepository.findOne({
      where: { id, isdeleted: false },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.findOne({
      where: { id, isdeleted: false },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isdeleted = true;
    return this.userRepository.save(user);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id, isdeleted: false },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.email !== undefined) {
      const isUserExist = await this.userRepository.findOne({
        where: { email: updateUserDto.email, id: Not(id) },
      });
      if (isUserExist) {
        throw new ConflictException('User with same email already exists');
      }
      user.email = updateUserDto.email;
    }

    if (updateUserDto.password !== undefined) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      user.password = hashedPassword;
    }

    // Update only the fields provided in the DTO
    if (updateUserDto.name !== undefined) user.name = updateUserDto.name;
    if (updateUserDto.role !== undefined) user.role = updateUserDto.role;
    if (updateUserDto.status !== undefined) user.status = updateUserDto.status;
    if (updateUserDto.department !== undefined)
      user.department = updateUserDto.department;

    return this.userRepository.save(user);
  }

  async listEmployeesUnderManager(managerId: string) {
    const employees = await this.employeeManagerRepository.find({
      where: { manager: { id: managerId } },
    });
    return employees;
  }
}
