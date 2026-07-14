import { randomUUID } from 'crypto';
import { IApplicationRepository } from '../../../domain/contracts/IApplicationRepository';
import { Application } from '../../../domain/entities/Application';
import { ConflictError } from '../../errors/ApplicationErrors';
import { normalizeApplicationName, normalizeFolderName, normalizeIsActive } from './ApplicationValidation';

export class CreateApplicationUseCase {
  constructor(private applicationRepository: IApplicationRepository) {}

  async execute(params: { name: unknown; folderName: unknown; isActive?: unknown }): Promise<Application> {
    const name = normalizeApplicationName(params.name);
    const folderName = normalizeFolderName(params.folderName);
    const isActive = normalizeIsActive(params.isActive, true);

    if (await this.applicationRepository.existsByFolderName(folderName)) {
      throw new ConflictError('folderName already exists.');
    }

    const now = new Date();
    return this.applicationRepository.create({
      id: randomUUID(),
      name,
      folderName,
      isActive,
      createdAt: now,
      updatedAt: now,
    });
  }
}
