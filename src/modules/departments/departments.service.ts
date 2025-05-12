import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Department } from './departments.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department) private repo: Repository<Department>,
  ) {}

  async create(name: string) {
    const isDepartmentExist = await this.repo.findOne({ where: { name } });
    if (isDepartmentExist) {
      throw new ConflictException('Department already exists');
    }
    const department = this.repo.create({ name });
    return this.repo.save(department);
  }

  async getAll() {
    return (await this.repo.find({ where: { isdeleted: false } })).sort(
      (a, b) => a.name.localeCompare(b.name),
    );
  }

  async getById(id: string) {
    return await this.repo.findOne({ where: { id, isdeleted: false } });
  }

  async update(id: string, name: string) {
    if (name?.length <= 0 || name === undefined || name === null) {
      throw new BadRequestException('Name cannot be empty');
    }
    const department = await this.repo.findOne({
      where: { id, isdeleted: false },
    });
    if (!department) {
      throw new NotFoundException('Department not found');
    }
    department.name = name;
    return this.repo.save(department);
  }

  async delete(id: string) {
    const department = await this.repo.findOne({
      where: { id, isdeleted: false },
    });
    if (!department) {
      throw new NotFoundException('Department not found');
    }
    department.isdeleted = true;
    return this.repo.save(department);
  }
}
