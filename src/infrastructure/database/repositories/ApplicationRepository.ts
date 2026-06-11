import { Repository } from 'typeorm';
import { IApplicationRepository } from '../../../domain/contracts/IApplicationRepository';
import { Application } from '../../../domain/entities/Application';
import { ApplicationEntity } from '../entities/ApplicationEntity';
import { AppDataSource } from '../data-source';

export class ApplicationRepository implements IApplicationRepository {
  private repo: Repository<ApplicationEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(ApplicationEntity);
  }

  async findById(id: string): Promise<Application | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? entity.toDomain() : null;
  }

  async findByFolderName(folderName: string): Promise<Application | null> {
    const entity = await this.repo.findOne({ where: { folderName } });
    return entity ? entity.toDomain() : null;
  }
}
