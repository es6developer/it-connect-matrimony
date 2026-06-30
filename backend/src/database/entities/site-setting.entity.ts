import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('site_settings')
export class SiteSetting {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  key: string;

  @Column({ type: 'longtext' })
  value: string;

  @Column({ type: 'varchar', length: 50, default: 'string' })
  type: string;

  @Index()
  @Column({ type: 'varchar', length: 100, default: 'general' })
  group: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
