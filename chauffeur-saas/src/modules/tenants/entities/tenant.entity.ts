import { Booking } from 'src/modules/bookings/entities/booking.entity';
import { Driver } from 'src/modules/drivers/entities/driver.entity';
import { Payment } from 'src/modules/payments/entities/payment.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Vehicle } from 'src/modules/vehicles/entities/vehicle.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CorporateAccount } from './corporate-account.entity';

export enum TenantStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug!: string;

  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
  logoUrl!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  domain!: string | null;

  @Column({ type: 'enum', enum: TenantStatus, default: TenantStatus.PENDING })
  status!: TenantStatus;

  @Column({ name: 'commission_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  commissionRate!: string;

  @Column({ name: 'subscription_plan', type: 'varchar', length: 50, nullable: true })
  subscriptionPlan!: string | null;

  @Column({ name: 'subscription_status', type: 'varchar', length: 50, nullable: true })
  subscriptionStatus!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => User, (user) => user.tenant)
  users!: User[];

  @OneToMany(() => Driver, (driver) => driver.tenant)
  drivers!: Driver[];

  @OneToMany(() => Vehicle, (vehicle) => vehicle.tenant)
  vehicles!: Vehicle[];

  @OneToMany(() => CorporateAccount, (corp) => corp.tenant)
  corporateAccounts!: CorporateAccount[];

  @OneToMany(() => Booking, (booking) => booking.tenant)
  bookings!: Booking[];

  @OneToMany(() => Payment, (payment) => payment.tenant)
  payments!: Payment[];
}
