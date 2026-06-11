import 'reflect-metadata';
import { DataSource } from 'typeorm';
import env from '../../config/env';
import { ApplicationEntity } from './entities/ApplicationEntity';
import { UploadedDocumentEntity } from './entities/UploadedDocumentEntity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST || 'localhost',
  port: env.DB_PORT ? parseInt(env.DB_PORT, 10) : 5432,
  username: env.DB_USER || 'postgres',
  password: env.DB_PASSWORD || 'postgres',
  database: env.DB_NAME || 'sest',
  synchronize: false,
  logging: false,
  entities: [ApplicationEntity, UploadedDocumentEntity],
  migrations: [],
  subscribers: [],
});
