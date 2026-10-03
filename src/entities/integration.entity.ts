import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IntegrationProvider, IntegrationStatus } from '../models/enums';
import { OrganizationEntity } from './organization.entity';

@Entity('integrations')
export class IntegrationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organization_id: string;

  @Column({
    type: 'text',
    enum: IntegrationProvider,
  })
  provider: IntegrationProvider;

  @Column({ type: 'text', nullable: true })
  provider_account_id: string | null;

  @Column({
    type: 'text',
    enum: IntegrationStatus,
    default: IntegrationStatus.ACTIVE,
  })
  status: IntegrationStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => OrganizationEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'organization_id' })
  organization?: OrganizationEntity;
}
