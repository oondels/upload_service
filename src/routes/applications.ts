import { Router, Request, Response } from 'express';
import { CreateApplicationUseCase } from '../application/useCases/applications/CreateApplicationUseCase';
import { DeactivateApplicationUseCase } from '../application/useCases/applications/DeactivateApplicationUseCase';
import { GetApplicationUseCase } from '../application/useCases/applications/GetApplicationUseCase';
import { ListApplicationsUseCase } from '../application/useCases/applications/ListApplicationsUseCase';
import { UpdateApplicationUseCase } from '../application/useCases/applications/UpdateApplicationUseCase';
import { ConflictError, NotFoundError, ValidationError } from '../application/errors/ApplicationErrors';
import { Application } from '../domain/entities/Application';

export interface ApplicationRouteDeps {
  createApplicationUseCase: CreateApplicationUseCase;
  listApplicationsUseCase: ListApplicationsUseCase;
  getApplicationUseCase: GetApplicationUseCase;
  updateApplicationUseCase: UpdateApplicationUseCase;
  deactivateApplicationUseCase: DeactivateApplicationUseCase;
}

export function createApplicationRoutes(deps: ApplicationRouteDeps): Router {
  const router = Router();

  router.get('/api/v1/applications', async (_req: Request, res: Response) => {
    const applications = await deps.listApplicationsUseCase.execute();
    res.status(200).json({ data: applications.map(toApplicationResponse) });
  });

  router.get('/api/v1/applications/:id', async (req: Request, res: Response) => {
    try {
      const application = await deps.getApplicationUseCase.execute(String(req.params.id));
      res.status(200).json(toApplicationResponse(application));
    } catch (error) {
      handleApplicationError(error, res);
    }
  });

  router.post('/api/v1/applications', async (req: Request, res: Response) => {
    try {
      const application = await deps.createApplicationUseCase.execute(req.body);
      res.status(201).json(toApplicationResponse(application));
    } catch (error) {
      handleApplicationError(error, res);
    }
  });

  router.put('/api/v1/applications/:id', async (req: Request, res: Response) => {
    try {
      const application = await deps.updateApplicationUseCase.execute(String(req.params.id), req.body);
      res.status(200).json(toApplicationResponse(application));
    } catch (error) {
      handleApplicationError(error, res);
    }
  });

  router.delete('/api/v1/applications/:id', async (req: Request, res: Response) => {
    try {
      const application = await deps.deactivateApplicationUseCase.execute(String(req.params.id));
      res.status(200).json(toApplicationResponse(application));
    } catch (error) {
      handleApplicationError(error, res);
    }
  });

  return router;
}

function toApplicationResponse(application: Application) {
  return {
    id: application.id,
    name: application.name,
    folderName: application.folderName,
    isActive: application.isActive,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
  };
}

function handleApplicationError(error: unknown, res: Response): void {
  if (error instanceof ValidationError) {
    res.status(400).json({ error: error.message });
    return;
  }

  if (error instanceof NotFoundError) {
    res.status(404).json({ error: error.message });
    return;
  }

  if (error instanceof ConflictError) {
    res.status(409).json({ error: error.message });
    return;
  }

  res.status(500).json({ error: 'Internal server error.' });
}
