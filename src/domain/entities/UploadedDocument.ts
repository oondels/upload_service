export type DocumentStatus = 'QUEUED' | 'COMPACTING' | 'SAVED' | 'EXPIRED_DELETED' | 'FAILED';

export class UploadedDocument {
  constructor(
    public readonly id: string,
    public readonly correlationId: string,
    public readonly applicationId: string,
    public readonly originalName: string,
    public readonly fileName: string,
    public readonly filePath: string,
    public readonly fileUrl: string,
    public readonly mimeType: string,
    public readonly sizeBytes: number,
    public readonly retentionDays: number | null,
    public readonly expiresAt: Date | null,
    public status: DocumentStatus,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  public updateStatus(newStatus: DocumentStatus): void {
    this.status = newStatus;
    this.updatedAt = new Date();
  }
}
