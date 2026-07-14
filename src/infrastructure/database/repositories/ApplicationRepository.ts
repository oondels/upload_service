import { Not, Repository } from 'typeorm';
import { CreateApplicationDTO, IApplicationRepository, UpdateApplicationDTO } from '../../../domain/contracts/IApplicationRepository';
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

  async findAll(): Promise<Application[]> {
    const entities = await this.repo.find({ order: { createdAt: 'DESC' } });
    return entities.map((entity) => entity.toDomain());
  }

  async create(application: CreateApplicationDTO): Promise<Application> {
    const entity = this.repo.create(application);
    const saved = await this.repo.save(entity);
    return saved.toDomain();
  }

  async update(id: string, data: UpdateApplicationDTO): Promise<Application | null> {
    await this.repo.update(id, { ...data, updatedAt: new Date() });
    return this.findById(id);
  }

  async deactivate(id: string): Promise<Application | null> {
    await this.repo.update(id, { isActive: false, updatedAt: new Date() });
    return this.findById(id);
  }

  async existsByFolderName(folderName: string, ignoreId?: string): Promise<boolean> {
    const entity = await this.repo.findOne({
      where: ignoreId ? { folderName, id: Not(ignoreId) } : { folderName },
      select: { id: true },
    });

    return Boolean(entity);
  }
}
