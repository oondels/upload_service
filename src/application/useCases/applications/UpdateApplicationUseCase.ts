import { IApplicationRepository } from '../../../domain/contracts/IApplicationRepository';
import { Application } from '../../../domain/entities/Application';
import { ConflictError, NotFoundError, ValidationError } from '../../errors/ApplicationErrors';
import { normalizeApplicationName, normalizeFolderName, normalizeIsActive } from './ApplicationValidation';

export class UpdateApplicationUseCase {
  constructor(private applicationRepository: IApplicationRepository) {}

  async execute(id: string, params: { name?: unknown; folderName?: unknown; isActive?: unknown }): Promise<Application> {
    const existing = await this.applicationRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Application not found.');
    }

    const updateData: { name?: string; folderName?: string; isActive?: boolean } = {};

    if (params.name !== undefined) {
      updateData.name = normalizeApplicationName(params.name);
    }

    if (params.folderName !== undefined) {
      updateData.folderName = normalizeFolderName(params.folderName);
      if (await this.applicationRepository.existsByFolderName(updateData.folderName, id)) {
        throw new ConflictError('folderName already exists.');
      }
    }

    if (params.isActive !== undefined) {
      updateData.isActive = normalizeIsActive(params.isActive, existing.isActive);
    }

    if (Object.keys(updateData).length === 0) {
      throw new ValidationError('At least one field must be provided.');
    }

    const updated = await this.applicationRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundError('Application not found.');
    }

    return updated;
  }
}
