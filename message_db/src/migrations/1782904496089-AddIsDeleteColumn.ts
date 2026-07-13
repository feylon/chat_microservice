import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsDeleteColumn1782904496089 implements MigrationInterface {
    name = 'AddIsDeleteColumn1782904496089'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" ADD "isDelete" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "isDelete"`);
    }

}
