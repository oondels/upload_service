export interface IStorageProvider {
  moveToFinalDestination(tempPath: string, appFolderName: string, finalFileName: string): Promise<{ filePath: string, fileUrl: string }>;
  saveBufferToFinalDestination(buffer: Buffer, appFolderName: string, finalFileName: string): Promise<{ filePath: string, fileUrl: string }>;
  deleteFile(filePath: string): Promise<void>;
}
