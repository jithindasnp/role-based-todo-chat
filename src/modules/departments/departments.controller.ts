import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('departments')
@UseGuards(RolesGuard)
export class DepartmentsController {
  constructor(private departmentsService: DepartmentsService) {}

  @Post('create')
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateDepartmentDto })
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Department created successfully',
  })
  async createDepartment(@Body() createDepartmentDto: CreateDepartmentDto) {
    const department = await this.departmentsService.create(
      createDepartmentDto.name,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Department created successfully',
      data: department,
    };
  }

  @Get('all')
  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Departments retrieved successfully',
  })
  async getAllDepartments() {
    const departments = await this.departmentsService.getAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Departments retrieved successfully',
      data: departments,
    };
  }

  @Get(':id')
  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a department by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Department retrieved successfully',
  })
  async getDepartmentById(@Param('id') id: string) {
    const department = await this.departmentsService.getById(id);
    if (!department) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Department not found',
        data: null,
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Department retrieved successfully',
      data: department,
    };
  }

  @Put(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: CreateDepartmentDto })
  @ApiOperation({ summary: 'Update a department' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Department updated successfully',
  })
  async updateDepartment(
    @Param('id') id: string,
    @Body() createDepartmentDto: CreateDepartmentDto,
  ) {
    const department = await this.departmentsService.update(
      id,
      createDepartmentDto.name,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Department updated successfully',
      data: department,
    };
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a department' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Department deleted successfully',
  })
  async deleteDepartment(@Param('id') id: string) {
    const department = await this.departmentsService.delete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Department deleted successfully',
      data: department,
    };
  }
}
