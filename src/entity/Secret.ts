import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Secret {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  secretText!: string;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date; 

  @Column()
  remainingViews!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}