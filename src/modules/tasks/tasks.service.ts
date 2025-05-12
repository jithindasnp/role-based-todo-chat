import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { EmployeeManagers } from '../employee-manager/entities/employee-managers.entity';
import { User } from '../users/users.entity';
import { ListTasksDto } from './dto/list-tasks.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(EmployeeManagers)
    private readonly employeeManagerRepository: Repository<EmployeeManagers>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  //service to create task for self

  async createOwnTask(createTaskDto: CreateTaskDto, userId: string) {
    const {
      title,
      description,
      due_date,
      priority = 'low',
      status = 'pending',
    } = createTaskDto;

    const task = this.taskRepository.create({
      title,
      description,
      due_date: new Date(due_date),
      priority,
      status,
      assignedTo: { id: userId },
      createdBy: { id: userId },
    });

    return await this.taskRepository.save(task);
  }

  //service to assign task to an employee
  async assignTask(
    employeeId: string,
    createTaskDto: CreateTaskDto,
    userId: string,
  ) {
    const {
      title,
      description,
      due_date,
      priority = 'low',
      status = 'pending',
    } = createTaskDto;

    const employee = await this.userRepository.findOne({
      where: { id: employeeId },
    });

    if (!employee || employee.role !== 'employee') {
      throw new NotFoundException('Employee not found');
    }

    const task = this.taskRepository.create({
      title,
      description,
      due_date: new Date(due_date),
      priority,
      status,
      assignedTo: { id: employeeId },
      createdBy: { id: userId },
    });

    return await this.taskRepository.save(task);
  }

  //service to list all tasks with pagination
  async listAllWithPagination(
    listTasksDto: ListTasksDto,
    userRole: string,
    userId: string,
  ) {
    const { priority, status, due_date, page = 1, limit = 10 } = listTasksDto;

    const whereCondition: any = { isdeleted: false };
    if (priority) whereCondition.priority = priority;
    if (status) whereCondition.status = status;
    if (due_date) {
      const startOfDay = new Date(due_date);
      startOfDay.setHours(0, 0, 0, 0); // Start of the day
      const endOfDay = new Date(due_date);
      endOfDay.setHours(23, 59, 59, 999); // End of the day

      whereCondition.due_date = Between(startOfDay, endOfDay); // Use the Between operator
    }
    if (userRole === 'employee' || userRole === 'manager') {
      whereCondition.assignedTo = { id: userId };
    }

    const [tasks, total] = await this.taskRepository.findAndCount({
      where: whereCondition,
      relations: ['assignedTo', 'createdBy'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: tasks,
      total,
      totalPages,
      currentPage: page,
    };
  }

  //service to change task status
  async changeTaskStatus(id: string, status: string) {
    if (
      status !== 'pending' &&
      status !== 'completed' &&
      status !== 'reopened'
    ) {
      throw new BadRequestException('Invalid status');
    }

    const task = await this.taskRepository.findOne({
      where: { id, isdeleted: false },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    task.status = status;
    return this.taskRepository.save(task);
  }

}
