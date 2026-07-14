import { IApplicationRepository } from '../../../domain/contracts/IApplicationRepository';
import { Application } from '../../../domain/entities/Application';

export class ListApplicationsUseCase {
  constructor(private applicationRepository: IApplicationRepository) {}

  async execute(): Promise<Application[]> {
    return this.applicationRepository.findAll();
  }
}
