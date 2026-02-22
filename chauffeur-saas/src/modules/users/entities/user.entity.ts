import { Booking } from 'src/modules/bookings/entities/booking.entity';
import { Driver } from 'src/modules/drivers/entities/driver.entity';
import { Notification } from 'src/modules/notifications/entities/notification.entity';
import { Tenant } from 'src/modules/tenants/entities/tenant.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  TENANT_STAFF = 'TENANT_STAFF',
  CORPORATE_ADMIN = 'CORPORATE_ADMIN',
  PASSENGER = 'PASSENGER',
  DRIVER = 'DRIVER',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  phone!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName!: string;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl!: string | null;

  @Column({ type: 'enum', enum: UserRole })
  role!: UserRole;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId!: string | null;

  @ManyToOne(() => Tenant, (tenant) => tenant.users, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant | null;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified!: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToOne(() => Driver, (driver) => driver.user)
  driverProfile!: Driver;

  @OneToMany(() => Booking, (booking) => booking.passenger)
  passengerBookings!: Booking[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications!: Notification[];
}
