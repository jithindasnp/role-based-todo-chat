import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateChatsTable1746686842597 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'chats',
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
                        name: 'type',
                        type: 'enum',
                        enum: ['direct', 'group'],
                        default: "'direct'",
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '255',
                        isNullable: true, // Nullable for direct chats
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
                        name: 'created_by',
                        type: 'varchar',
                        length: '36',
                        isNullable: false,
                    },
                ],
            }),
            true,
        );

        // Add foreign key
        await queryRunner.createForeignKey(
            'chats',
            new TableForeignKey({
                columnNames: ['created_by'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('chats', 'FK_chats_created_by_users_id');
        await queryRunner.dropTable('chats');
    }

}
