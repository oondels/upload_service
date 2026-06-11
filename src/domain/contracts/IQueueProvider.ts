export interface IQueueProvider {
  publishUploadJob(correlationId: string, payload?: any): Promise<void>;
}
