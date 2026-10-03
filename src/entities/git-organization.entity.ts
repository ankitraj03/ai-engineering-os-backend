import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IntegrationEntity } from './integration.entity';

@Entity('git_organizations')
export class GitOrganizationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  integration_id: string;

  @Column({ type: 'text' })
  external_id: string;

  @Column({ type: 'text', nullable: true })
  name: string | null;

  @Column({ type: 'text' })
  login: string;

  @Column({ type: 'text', nullable: true })
  avatar_url: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => IntegrationEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'integration_id' })
  integration?: IntegrationEntity;
}
