import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UploadedDocument, DocumentStatus } from '../../../domain/entities/UploadedDocument';
import { ApplicationEntity } from './ApplicationEntity';

@Entity('uploaded_documents', { schema: 'uploads' })
export class UploadedDocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', unique: true, name: 'correlation_id' })
  correlationId!: string;

  @Column({ type: 'uuid', name: 'application_id' })
  applicationId!: string;

  @ManyToOne(() => ApplicationEntity)
  @JoinColumn({ name: 'application_id' })
  application!: ApplicationEntity;

  @Column({ type: 'varchar', length: 255, name: 'original_name' })
  originalName!: string;

  @Column({ type: 'varchar', length: 255, name: 'file_name' })
  fileName!: string;

  @Column({ type: 'varchar', length: 500, name: 'file_path' })
  filePath!: string;

  @Column({ type: 'varchar', length: 500, name: 'file_url' })
  fileUrl!: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'mime_type' })
  mimeType!: string;

  @Column({ type: 'bigint', nullable: true, name: 'size_bytes', transformer: { to: (value: number) => value, from: (value: string) => parseInt(value, 10) } })
  sizeBytes!: number;

  @Column({ type: 'int', nullable: true, name: 'retention_days' })
  retentionDays!: number | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'expires_at' })
  expiresAt!: Date | null;

  @Column({ type: 'varchar', length: 50 })
  status!: DocumentStatus;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;

  toDomain(): UploadedDocument {
    return new UploadedDocument(
      this.id,
      this.correlationId,
      this.applicationId,
      this.originalName,
      this.fileName,
      this.filePath,
      this.fileUrl,
      this.mimeType,
      this.sizeBytes,
      this.retentionDays,
      this.expiresAt,
      this.status,
      this.createdAt,
      this.updatedAt
    );
  }
}
