import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/users.entity';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserEmployeeDto } from './dto/create-employee.dto';
import { Request } from 'express';
import { EmployeeManagers } from '../employee-manager/entities/employee-managers.entity';
import * as bcrypt from 'bcrypt';
import { JwtStrategy } from '../../auth/jwt.strategy';

// Extend the Request type to include the user property
interface AuthenticatedRequest extends Request {
  user: { role: string }; // Define the user property
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(EmployeeManagers)
    private readonly employeeManagerRepository: Repository<EmployeeManagers>,
    private readonly jwtService: JwtService,
    private readonly jwtStrategy: JwtStrategy,
  ) {}

  async validateUser(payload: any): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    return user;
  }

  async validateToken(token: string): Promise<User> {
    try {
      // Decode the token to extract the payload
      const decodedToken = this.jwtService.decode(token) as { sub: string };
      
      // If the token can't be decoded, throw an unauthorized exception
      if (!decodedToken || !decodedToken.sub) {
        throw new UnauthorizedException('Invalid token');
      }

      // Use the existing validateUser method to find and validate the user
      return await this.validateUser(decodedToken);
    } catch (error) {
      // Handle different types of errors
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // For other errors (like JWT decoding errors), throw an unauthorized exception
      throw new UnauthorizedException('Invalid token');
    }
  }

  async generateToken(user: User): Promise<string> {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  async registerUser(
    createUserDto: CreateUserDto | CreateUserEmployeeDto,
    req: Request,
  ): Promise<User> {
    const isUserExist = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (isUserExist) {
      throw new ConflictException('User already exists');
    }

    const { role, ...userData } = createUserDto;

    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10); // 10 is the salt rounds

    // Allow anyone to create an admin
    if (role === 'admin') {
      const user = this.userRepository.create({
        ...userData,
        password: hashedPassword, // Use the hashed password
        role,
      });
      return this.userRepository.save(user);
    }

    // Extract the token from the request
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token is required to create managers or employees');
    }
    const decodedToken = this.jwtService.decode(token) as { role: string };

    // Use the JwtStrategy to validate the token and get the user
    const user = await this.jwtStrategy.validate(decodedToken);
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admin can create managers and employees');
    }

    // Start a transaction
    return this.userRepository.manager.transaction(async (transactionalEntityManager) => {
      // Create and save the user
      const newUser = this.userRepository.create({
        ...userData,
        password: hashedPassword, // Use the hashed password
        role,
      });
      const savedUser = await transactionalEntityManager.save(newUser);

      // Create an entry in the EmployeeManagers table if the user is an employee
      if (role === 'employee' && 'manager_id' in createUserDto) {
        const manager = await transactionalEntityManager.findOne(User, {
          where: { id: createUserDto.manager_id },
        });

        if (!manager) {
          throw new NotFoundException('Manager not found');
        }

        const employeeManagers = this.employeeManagerRepository.create({
          employee: savedUser,
          manager: manager,
          status: 'active',
        });
        await transactionalEntityManager.save(employeeManagers);
      }

      return savedUser;
    });
  }

  async login(email: string, password: string): Promise<{ token: string }> {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Incorrect password');
    }

    // Generate and return the JWT token
    const token = await this.generateToken(user);
    return { token };
  }

  private isAdminRequest(req: AuthenticatedRequest): boolean {
    const user = req.user; 
    return user && user.role === 'admin';
  }

}
