import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateTasksTable1746686819169 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'tasks',
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
                        name: 'title',
                        type: 'varchar',
                        length: '50',
                        isNullable: false,
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'due_date',
                        type: 'date',
                        isNullable: false,
                    },
                    {
                        name: 'priority',
                        type: 'enum',
                        enum: ['low', 'medium', 'high'],
                        default: "'low'",
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['pending', 'completed', 'reopened'],
                        default: "'pending'",
                    },
                    {
                        name: 'assigned_to',
                        type: 'varchar',
                        length: '36',
                        isNullable: false,
                    },
                    {
                        name: 'created_by',
                        type: 'varchar',
                        length: '36',
                        isNullable: false,
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
                        name: 'updated_by',
                        type: 'varchar',
                        length: '36',
                        isNullable: true,
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true,
        );

        // Add foreign keys
        await queryRunner.createForeignKey(
            'tasks',
            new TableForeignKey({
                columnNames: ['assigned_to'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'tasks',
            new TableForeignKey({
                columnNames: ['created_by'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'tasks',
            new TableForeignKey({
                columnNames: ['updated_by'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('tasks', 'FK_tasks_assigned_to_users_id');
        await queryRunner.dropForeignKey('tasks', 'FK_tasks_created_by_users_id');
        await queryRunner.dropForeignKey('tasks', 'FK_tasks_updated_by_users_id');
        await queryRunner.dropTable('tasks');
    }

}
