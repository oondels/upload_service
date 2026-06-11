import { Application } from '../entities/Application';

export interface IApplicationRepository {
  findById(id: string): Promise<Application | null>;
  findByFolderName(folderName: string): Promise<Application | null>;
}
