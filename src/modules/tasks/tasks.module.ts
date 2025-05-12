import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeManagers } from '../employee-manager/entities/employee-managers.entity';
import { User } from '../users/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, EmployeeManagers, User])],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
