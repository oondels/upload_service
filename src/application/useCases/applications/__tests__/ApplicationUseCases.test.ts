import { CreateApplicationDTO, IApplicationRepository, UpdateApplicationDTO } from '../../../../domain/contracts/IApplicationRepository';
import { Application } from '../../../../domain/entities/Application';
import { CreateApplicationUseCase } from '../CreateApplicationUseCase';
import { UpdateApplicationUseCase } from '../UpdateApplicationUseCase';
import { DeactivateApplicationUseCase } from '../DeactivateApplicationUseCase';

class FakeApplicationRepository implements IApplicationRepository {
  private applications = new Map<string, Application>();

  async findById(id: string): Promise<Application | null> {
    return this.applications.get(id) ?? null;
  }

  async findByFolderName(folderName: string): Promise<Application | null> {
    return [...this.applications.values()].find((app) => app.folderName === folderName) ?? null;
  }

  async findAll(): Promise<Application[]> {
    return [...this.applications.values()];
  }

  async create(application: CreateApplicationDTO): Promise<Application> {
    const created = new Application(
      application.id,
      application.name,
      application.folderName,
      application.isActive,
      application.createdAt,
      application.updatedAt
    );
    this.applications.set(created.id, created);
    return created;
  }

  async update(id: string, data: UpdateApplicationDTO): Promise<Application | null> {
    const existing = this.applications.get(id);
    if (!existing) return null;

    const updated = new Application(
      existing.id,
      data.name ?? existing.name,
      data.folderName ?? existing.folderName,
      data.isActive ?? existing.isActive,
      existing.createdAt,
      new Date()
    );
    this.applications.set(id, updated);
    return updated;
  }

  async deactivate(id: string): Promise<Application | null> {
    return this.update(id, { isActive: false });
  }

  async existsByFolderName(folderName: string, ignoreId?: string): Promise<boolean> {
    return [...this.applications.values()].some((app) => app.folderName === folderName && app.id !== ignoreId);
  }
}

describe('Application use cases', () => {
  it('creates an active application with normalized folderName', async () => {
    const repo = new FakeApplicationRepository();
    const useCase = new CreateApplicationUseCase(repo);

    const application = await useCase.execute({ name: 'Pense e Aja', folderName: 'PENSE-E-AJA' });

    expect(application.name).toBe('Pense e Aja');
    expect(application.folderName).toBe('pense-e-aja');
    expect(application.isActive).toBe(true);
  });

  it('rejects unsafe folderName values', async () => {
    const repo = new FakeApplicationRepository();
    const useCase = new CreateApplicationUseCase(repo);

    await expect(useCase.execute({ name: 'Unsafe', folderName: '../unsafe' })).rejects.toThrow(
      'folderName must contain 3-100 lowercase letters, numbers, hyphens or underscores.'
    );
  });

  it('rejects duplicate folderName values', async () => {
    const repo = new FakeApplicationRepository();
    const useCase = new CreateApplicationUseCase(repo);

    await useCase.execute({ name: 'First', folderName: 'pense-e-aja' });

    await expect(useCase.execute({ name: 'Second', folderName: 'pense-e-aja' })).rejects.toThrow(
      'folderName already exists.'
    );
  });

  it('updates application fields and soft-deletes via deactivate', async () => {
    const repo = new FakeApplicationRepository();
    const created = await new CreateApplicationUseCase(repo).execute({ name: 'First', folderName: 'first-app' });

    const updated = await new UpdateApplicationUseCase(repo).execute(created.id, { name: 'Renamed', isActive: true });
    const deactivated = await new DeactivateApplicationUseCase(repo).execute(created.id);

    expect(updated.name).toBe('Renamed');
    expect(deactivated.isActive).toBe(false);
  });
});
