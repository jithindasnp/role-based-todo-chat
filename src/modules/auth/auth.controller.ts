import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { CreateUserEmployeeDto } from './dto/create-employee.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@ApiTags('Auth')
@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateUserDto })
  @ApiOperation({ summary: 'Register a new user (admin, manager, or employee)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
  })
  async register(
    @Body() createUserDto: CreateUserDto | CreateUserEmployeeDto,
    @Req() req: Request,
  ) {
    const user = await this.authService.registerUser(createUserDto, req);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User registered successfully',
      data: user,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LoginUserDto })
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User logged in successfully',
  })
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.authService.login(
      loginUserDto.email,
      loginUserDto.password,
    );
    if (!user) {
      return {
        statusCode: HttpStatus.OK,
        message: 'User not found',
        data: null,
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'User logged in successfully',
      data: user,
    };
  }
}
