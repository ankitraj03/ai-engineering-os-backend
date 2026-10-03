import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GitOrganizationEntity } from './git-organization.entity';

@Entity('repositories')
export class RepositoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  git_organization_id: string;

  @Column({ type: 'uuid', nullable: true })
  project_id: string | null;

  @Column({ type: 'text' })
  external_id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  full_name: string;

  @Column({ type: 'text', default: 'main' })
  default_branch: string;

  @Column({ type: 'boolean', default: false })
  is_private: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => GitOrganizationEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'git_organization_id' })
  gitOrganization?: GitOrganizationEntity;
}
