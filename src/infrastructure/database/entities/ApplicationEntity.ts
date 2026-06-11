import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { Application } from '../../../domain/entities/Application';

@Entity('applications')
export class ApplicationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 100, unique: true, name: 'folder_name' })
  folderName!: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  toDomain(): Application {
    return new Application(this.id, this.name, this.folderName, this.isActive, this.createdAt);
  }
}
