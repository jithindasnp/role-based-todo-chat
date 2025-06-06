import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIsdeletedToDepartment1746685384461
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'departments',
      new TableColumn({
        name: 'isdeleted',
        type: 'boolean',
        default: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('departments', 'isdeleted');
  }
}
