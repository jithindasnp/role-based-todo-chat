import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  HttpStatus,
  HttpCode,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Roles } from 'src/decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guards/roles.guard';
import { ListTasksDto } from './dto/list-tasks.dto';

// Extend the Request type to include the user property
interface CustomRequest extends Request {
  user: {
    role: string;
    id: string;
  };
}

@ApiTags('Tasks')
@Controller('tasks')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  //Api cotroller for creating task for self
  @Post()
  @Roles('admin', 'manager', 'employee')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateTaskDto })
  @ApiOperation({ summary: 'Create a new task for the logged in user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Task created successfully',
  })
  async createSelfTask(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: CustomRequest,
  ) {
    const userId = req.user?.id;
    const task = await this.tasksService.createOwnTask(createTaskDto, userId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Task created successfully',
      data: task,
    };
  }

  //Api controller for assigning task to an employee
  @Post('assign/:id')
  @Roles('manager')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateTaskDto })
  @ApiOperation({ summary: 'Assign a task to an employee' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Task assigned successfully',
  })
  async assignTask(
    @Param('id') id: string,
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: CustomRequest,
  ) {
    const userId = req.user?.id;
    const task = await this.tasksService.assignTask(id, createTaskDto, userId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Task assigned successfully',
      data: task,
    };
  }

  //Api controller for listing tasks
  @Get('list')
  @Roles('admin', 'manager', 'employee')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all tasks' })
  @ApiQuery({ name: 'title', required: false, type: String })
  @ApiQuery({
    name: 'priority',
    required: false,
    enum: ['low', 'medium', 'high'],
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'completed', 'reopened'],
  })
  @ApiQuery({ name: 'due_date', required: false, type: String })
  @ApiQuery({ name: 'page', required: true, type: Number })
  @ApiQuery({ name: 'limit', required: true, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tasks retrieved successfully',
  })
  async listTasks(
    @Query() listTasksDto: ListTasksDto,
    @Request() req: CustomRequest,
  ) {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const tasks = await this.tasksService.listAllWithPagination(
      listTasksDto,
      userRole,
      userId,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Tasks retrieved successfully',
      data: tasks,
    };
  }

  //Api controller for changing task status
  @Patch('status/:id')
  @Roles('admin', 'manager', 'employee')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: UpdateTaskDto })
  @ApiOperation({ summary: 'Change task status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task status changed successfully',
  })
  async changeTaskStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    const task = await this.tasksService.changeTaskStatus(id, status);
    return {
      statusCode: HttpStatus.OK,
      message: 'Task status changed successfully',
      data: task,
    };
  }
}
