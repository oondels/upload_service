import { MigrationInterface, QueryRunner } from "typeorm";

export class Ajustes1784028214203 implements MigrationInterface {
    name = 'Ajustes1784028214203'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."applications" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."applications" DROP COLUMN "updated_at"`);
    }

}
