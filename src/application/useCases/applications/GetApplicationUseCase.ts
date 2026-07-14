import { IApplicationRepository } from '../../../domain/contracts/IApplicationRepository';
import { Application } from '../../../domain/entities/Application';
import { NotFoundError } from '../../errors/ApplicationErrors';

export class GetApplicationUseCase {
  constructor(private applicationRepository: IApplicationRepository) {}

  async execute(id: string): Promise<Application> {
    const application = await this.applicationRepository.findById(id);
    if (!application) {
      throw new NotFoundError('Application not found.');
    }

    return application;
  }
}
