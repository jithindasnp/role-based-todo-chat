import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateEmployeeManagersTable1746686805372 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'employee_managers',
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
                        name: 'employee_id',
                        type: 'varchar',
                        length: '36',
                        isNullable: false,
                    },
                    {
                        name: 'manager_id',
                        type: 'varchar',
                        length: '36',
                        isNullable: false,
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
                ],
            }),
            true,
        );

        // Add foreign keys
        await queryRunner.createForeignKey(
            'employee_managers',
            new TableForeignKey({
                columnNames: ['employee_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'employee_managers',
            new TableForeignKey({
                columnNames: ['manager_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('employee_managers', 'FK_employee_managers_employee_id_users_id');
        await queryRunner.dropForeignKey('employee_managers', 'FK_employee_managers_manager_id_users_id');
        await queryRunner.dropTable('employee_managers');
    }

}
