import { MigrationInterface, QueryRunner } from "typeorm";

export class FileMessageRelation1783200000000 implements MigrationInterface {
    name = 'FileMessageRelation1783200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "files" ADD "messageId" uuid`);
        await queryRunner.query(`ALTER TABLE "files" ADD CONSTRAINT "UQ_files_messageId" UNIQUE ("messageId")`);
        await queryRunner.query(`ALTER TABLE "files" ADD CONSTRAINT "FK_files_messageId" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "files" DROP CONSTRAINT "FK_files_messageId"`);
        await queryRunner.query(`ALTER TABLE "files" DROP CONSTRAINT "UQ_files_messageId"`);
        await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "messageId"`);
    }

}
