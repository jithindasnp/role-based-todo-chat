import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { DepartmentsService } from './departments.service';
// import { DepartmentsController } from './departments.controller';
import { Department } from './departments.entity';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Department])],
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
//   controllers: [DepartmentsController],
//   providers: [DepartmentsService],
//   exports: [DepartmentsService],
})
export class DepartmentsModule {}