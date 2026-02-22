import { Booking } from 'src/modules/bookings/entities/booking.entity';
import { Tenant } from 'src/modules/tenants/entities/tenant.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum PaymentMethod {
  CARD = 'CARD',
  CORPORATE_ACCOUNT = 'CORPORATE_ACCOUNT',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  CAPTURED = 'CAPTURED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId!: string;

  @ManyToOne(() => Booking, (booking) => booking.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking!: Booking;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: string;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod })
  paymentMethod!: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @Column({ name: 'stripe_payment_intent_id', type: 'varchar', length: 255, nullable: true })
  stripePaymentIntentId!: string | null;

  @Column({ name: 'platform_fee', type: 'decimal', precision: 12, scale: 2, default: 0 })
  platformFee!: string;

  @Column({ name: 'tenant_payout', type: 'decimal', precision: 12, scale: 2, default: 0 })
  tenantPayout!: string;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
