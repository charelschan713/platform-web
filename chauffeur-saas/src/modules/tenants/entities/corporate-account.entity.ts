import { Booking } from 'src/modules/bookings/entities/booking.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';

export enum PaymentTerms {
  PREPAID = 'PREPAID',
  NET15 = 'NET15',
  NET30 = 'NET30',
}

@Entity('corporate_accounts')
export class CorporateAccount {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.corporateAccounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @Column({ name: 'company_name', type: 'varchar', length: 200 })
  companyName!: string;

  @Column({ name: 'tax_id', type: 'varchar', length: 100, nullable: true })
  taxId!: string | null;

  @Column({ name: 'billing_email', type: 'varchar', length: 255 })
  billingEmail!: string;

  @Column({ name: 'billing_address', type: 'text', nullable: true })
  billingAddress!: string | null;

  @Column({ name: 'credit_limit', type: 'decimal', precision: 12, scale: 2, default: 0 })
  creditLimit!: string;

  @Column({ name: 'current_balance', type: 'decimal', precision: 12, scale: 2, default: 0 })
  currentBalance!: string;

  @Column({ name: 'payment_terms', type: 'enum', enum: PaymentTerms, default: PaymentTerms.PREPAID })
  paymentTerms!: PaymentTerms;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Booking, (booking) => booking.corporateAccount)
  bookings!: Booking[];
}
