import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/users.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'date' })
  due_date: Date;

  @Column({ type: 'enum', enum: ['low', 'medium', 'high'], default: 'medium' })
  priority: string;

  @Column({ type: 'enum', enum: ['pending', 'completed', 'reopened'], default: 'pending' })
  status: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'assigned_to' })
  assignedTo: User;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ default: false })
  isdeleted: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'updated_by' })
  updatedBy: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}