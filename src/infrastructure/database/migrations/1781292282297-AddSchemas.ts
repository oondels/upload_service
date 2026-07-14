import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSchemas1781292282297 implements MigrationInterface {
  name = 'AddSchemas1781292282297';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "core"`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "uploads"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "core"."applications" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_applications_folder_name" ON "core"."applications" ("folder_name")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_docs_cron_cleanup" ON "uploads"."uploaded_documents" ("status", "expires_at")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_docs_correlation" ON "uploads"."uploaded_documents" ("correlation_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "uploads"."idx_docs_correlation"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "uploads"."idx_docs_cron_cleanup"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "core"."idx_applications_folder_name"`);
  }
}
