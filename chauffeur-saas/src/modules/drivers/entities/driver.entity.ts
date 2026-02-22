import { Booking } from 'src/modules/bookings/entities/booking.entity';
import { Tenant } from 'src/modules/tenants/entities/tenant.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Vehicle } from 'src/modules/vehicles/entities/vehicle.entity';
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

export enum DriverStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId!: string;

  @OneToOne(() => User, (user) => user.driverProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.drivers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @Column({ name: 'license_number', type: 'varchar', length: 100 })
  licenseNumber!: string;

  @Column({ name: 'license_expiry', type: 'date' })
  licenseExpiry!: string;

  @Column({ type: 'enum', enum: DriverStatus, default: DriverStatus.PENDING })
  status!: DriverStatus;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 5 })
  rating!: string;

  @Column({ name: 'total_trips', type: 'int', default: 0 })
  totalTrips!: number;

  @Column({ name: 'is_available', type: 'boolean', default: false })
  isAvailable!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.driver)
  vehicles!: Vehicle[];

  @OneToMany(() => Booking, (booking) => booking.driver)
  bookings!: Booking[];
}
