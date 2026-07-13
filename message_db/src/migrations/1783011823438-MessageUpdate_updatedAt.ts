import { MigrationInterface, QueryRunner } from "typeorm";

export class MessageUpdateUpdatedAt1783011823438 implements MigrationInterface {
    name = 'MessageUpdateUpdatedAt1783011823438'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`CREATE INDEX "IDX_284257a7a4f1c23a4bda08ecf2" ON "messages"  ("updatedAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_284257a7a4f1c23a4bda08ecf2"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "updatedAt"`);
    }

}
