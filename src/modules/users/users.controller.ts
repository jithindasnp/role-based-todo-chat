import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Query,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from './users.entity';
// import { CreateUserDto } from './dto/create-user.dto';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('all')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users retrieved successfully',
  })
  async getAllUsers(
    @Query('role') role: string = 'all',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const users = await this.usersService.listAllWithRoleFilterWithPagination(
      role,
      page,
      limit,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Users retrieved successfully',
      data: users,
    };
  }

  @Get('details/:id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user details by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User details retrieved successfully',
  })
  async getUserDetails(@Param('id') id: string) {
    const user = await this.usersService.userDetails(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User details retrieved successfully',
      data: user,
    };
  }

  @Delete('delete/:id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User deleted successfully',
  })
  async deleteUser(@Param('id') id: string) {
    const user = await this.usersService.deleteUser(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User deleted successfully',
      data: user,
    };
  }

  @Patch('update/:id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: UpdateUserDto })
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully',
  })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.updateUser(id, updateUserDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'User updated successfully',
      data: user,
    };
  }

  @Get('employees/:managerId')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get employees under a manager' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Employees retrieved successfully',
  })
  async getEmployeesUnderManager(@Param('managerId') managerId: string) {
    const employees = await this.usersService.listEmployeesUnderManager(
      managerId,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Employees retrieved successfully',
      data: employees,
    };
  }
}
