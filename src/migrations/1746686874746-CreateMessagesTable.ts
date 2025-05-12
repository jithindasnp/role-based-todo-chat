import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateMessagesTable1746686874746 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'messages',
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
                        name: 'sender_id',
                        type: 'varchar',
                        length: '36',
                        isNullable: false,
                    },
                    {
                        name: 'receiver_id',
                        type: 'varchar',
                        length: '36',
                        isNullable: false,
                    },
                    {
                        name: 'content',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'sent_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true,
        );

        // Add foreign keys
        await queryRunner.createForeignKey(
            'messages',
            new TableForeignKey({
                columnNames: ['chat_id'],
                referencedTableName: 'chats',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'messages',
            new TableForeignKey({
                columnNames: ['sender_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'messages',
            new TableForeignKey({
                columnNames: ['receiver_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('messages', 'FK_messages_chat_id_chats_id');
        await queryRunner.dropForeignKey('messages', 'FK_messages_sender_id_users_id');
        await queryRunner.dropForeignKey('messages', 'FK_messages_receiver_id_users_id');
        await queryRunner.dropTable('messages');
    }

}
