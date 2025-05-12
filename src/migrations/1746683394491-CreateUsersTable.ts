import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateUsersTable1746683394491 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create role enum
    // await queryRunner.query(`CREATE TYPE role_enum AS ENUM ('ADMIN', 'MANAGER', 'EMPLOYEE')`);

    // Create status enum
    // await queryRunner.query(`CREATE TYPE status_enum AS ENUM ('ACTIVE', 'INACTIVE')`);

    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'department_id',
            type: 'varchar',
            length: '36',
            isNullable: true, // Assuming department_id can be null if not assigned
          },
          {
            name: 'name',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '50',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['admin', 'manager', 'employee'], 
            default: "'employee'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive'],
            default: "'active'",
          },
          {
            name: 'isdeleted',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_by',
            type: 'varchar',
            length: '36',
            isNullable: true, // Nullable since initial creation may not have an updated_by
          },
        ],
      }),
      true,
    );

    // Add foreign key for department_id
    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['department_id'],
        referencedTableName: 'departments',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL', // If department is deleted, set department_id to NULL
      }),
    );

    // Add foreign key for updated_by (self-referential)
    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['updated_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL', // If the updating user is deleted, set updated_by to NULL
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey('users', 'FK_users_department_id_departments_id');
    await queryRunner.dropForeignKey('users', 'FK_users_updated_by_users_id');

    // Drop users table
    await queryRunner.dropTable('users');

  }
}