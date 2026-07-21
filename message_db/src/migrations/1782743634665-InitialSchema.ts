import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1782743634665 implements MigrationInterface {
    name = 'InitialSchema1782743634665'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE TABLE "files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fileName" character varying NOT NULL, "filePath" character varying NOT NULL, "mimeType" character varying NOT NULL, "fileSize" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "conversationId" uuid NOT NULL, "senderId" character varying NOT NULL, "content" text, "messageType" character varying NOT NULL DEFAULT 'text', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "isRead" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e5663ce0c730b2de83445e2fd1" ON "messages"  ("conversationId") `);
        await queryRunner.query(`CREATE INDEX "IDX_2db9cf2b3ca111742793f6c37c" ON "messages"  ("senderId") `);
        await queryRunner.query(`CREATE INDEX "IDX_6ce6acdb0801254590f8a78c08" ON "messages"  ("createdAt") `);
        await queryRunner.query(`CREATE TABLE "conversations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "participants" text NOT NULL, "type" character varying NOT NULL DEFAULT 'private', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ee34f4f7ced4ec8681f26bf04ef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users_cache" ("id" character varying NOT NULL, "username" character varying NOT NULL, "avatarUrl" character varying, CONSTRAINT "PK_4cd1b18d1758403c2dd87a3c05d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_e5663ce0c730b2de83445e2fd19" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_e5663ce0c730b2de83445e2fd19"`);
        await queryRunner.query(`DROP TABLE "users_cache"`);
        await queryRunner.query(`DROP TABLE "conversations"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6ce6acdb0801254590f8a78c08"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2db9cf2b3ca111742793f6c37c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e5663ce0c730b2de83445e2fd1"`);
        await queryRunner.query(`DROP TABLE "messages"`);
        await queryRunner.query(`DROP TABLE "files"`);
    }

}
