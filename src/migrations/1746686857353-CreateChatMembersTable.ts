import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateChatMembersTable1746686857353 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'chat_members',
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
                        name: 'chat_id',
                        type: 'varchar',
                        length: '36',
                        isNullable: false,
                    },
                    {
                        name: 'user_id',
                        type: 'varchar',
                        length: '36',
                        isNullable: false,
                    },
                    {
                        name: 'joined_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true,
        );

        // Add foreign keys
        await queryRunner.createForeignKey(
            'chat_members',
            new TableForeignKey({
                columnNames: ['chat_id'],
                referencedTableName: 'chats',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'chat_members',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('chat_members', 'FK_chat_members_chat_id_chats_id');
        await queryRunner.dropForeignKey('chat_members', 'FK_chat_members_user_id_users_id');
        await queryRunner.dropTable('chat_members');
    }

}
