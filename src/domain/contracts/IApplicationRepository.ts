import { Application } from '../entities/Application';

export interface CreateApplicationDTO {
  id: string;
  name: string;
  folderName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateApplicationDTO {
  name?: string;
  folderName?: string;
  isActive?: boolean;
}

export interface IApplicationRepository {
  findById(id: string): Promise<Application | null>;
  findByFolderName(folderName: string): Promise<Application | null>;
  findAll(): Promise<Application[]>;
  create(application: CreateApplicationDTO): Promise<Application>;
  update(id: string, data: UpdateApplicationDTO): Promise<Application | null>;
  deactivate(id: string): Promise<Application | null>;
  existsByFolderName(folderName: string, ignoreId?: string): Promise<boolean>;
}
