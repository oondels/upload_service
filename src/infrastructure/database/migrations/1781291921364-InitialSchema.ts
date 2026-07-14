import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1781291921364 implements MigrationInterface {
  name = 'InitialSchema1781291921364';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "core"`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "uploads"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "core"."applications" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(255) NOT NULL,
        "folder_name" character varying(100) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_applications_folder_name" UNIQUE ("folder_name"),
        CONSTRAINT "PK_applications" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "uploads"."uploaded_documents" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "correlation_id" uuid NOT NULL,
        "application_id" uuid NOT NULL,
        "original_name" character varying(255) NOT NULL,
        "file_name" character varying(255) NOT NULL,
        "file_path" character varying(500) NOT NULL,
        "file_url" character varying(500) NOT NULL,
        "mime_type" character varying(100),
        "size_bytes" bigint,
        "retention_days" integer,
        "expires_at" TIMESTAMP WITH TIME ZONE,
        "status" character varying(50) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_uploaded_documents_correlation_id" UNIQUE ("correlation_id"),
        CONSTRAINT "PK_uploaded_documents" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_uploaded_documents_application_id'
        ) THEN
          ALTER TABLE "uploads"."uploaded_documents"
          ADD CONSTRAINT "FK_uploaded_documents_application_id"
          FOREIGN KEY ("application_id") REFERENCES "core"."applications"("id")
          ON DELETE NO ACTION ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_applications_folder_name" ON "core"."applications" ("folder_name")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_docs_cron_cleanup" ON "uploads"."uploaded_documents" ("status", "expires_at")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_docs_correlation" ON "uploads"."uploaded_documents" ("correlation_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "uploads"."uploaded_documents"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."applications"`);
  }
}
