import { Payment } from 'src/modules/payments/entities/payment.entity';
import { CorporateAccount } from 'src/modules/tenants/entities/corporate-account.entity';
import { Tenant } from 'src/modules/tenants/entities/tenant.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Vehicle, VehicleClass } from 'src/modules/vehicles/entities/vehicle.entity';
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
import { Driver } from '../../drivers/entities/driver.entity';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DRIVER_ASSIGNED = 'DRIVER_ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @Column({ name: 'passenger_id', type: 'uuid' })
  passengerId!: string;

  @ManyToOne(() => User, (user) => user.passengerBookings, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'passenger_id' })
  passenger!: User;

  @Column({ name: 'driver_id', type: 'uuid', nullable: true })
  driverId!: string | null;

  @ManyToOne(() => Driver, (driver) => driver.bookings, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'driver_id' })
  driver!: Driver | null;

  @Column({ name: 'vehicle_id', type: 'uuid', nullable: true })
  vehicleId!: string | null;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.bookings, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle!: Vehicle | null;

  @Column({ name: 'corporate_account_id', type: 'uuid', nullable: true })
  corporateAccountId!: string | null;

  @ManyToOne(() => CorporateAccount, (corp) => corp.bookings, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'corporate_account_id' })
  corporateAccount!: CorporateAccount | null;

  @Column({ name: 'pickup_address', type: 'text' })
  pickupAddress!: string;

  @Column({ name: 'pickup_lat', type: 'decimal', precision: 10, scale: 7 })
  pickupLat!: string;

  @Column({ name: 'pickup_lng', type: 'decimal', precision: 10, scale: 7 })
  pickupLng!: string;

  @Column({ name: 'dropoff_address', type: 'text' })
  dropoffAddress!: string;

  @Column({ name: 'dropoff_lat', type: 'decimal', precision: 10, scale: 7 })
  dropoffLat!: string;

  @Column({ name: 'dropoff_lng', type: 'decimal', precision: 10, scale: 7 })
  dropoffLng!: string;

  @Column({ name: 'pickup_datetime', type: 'timestamptz' })
  pickupDatetime!: Date;

  @Column({ name: 'vehicle_class', type: 'enum', enum: VehicleClass })
  vehicleClass!: VehicleClass;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status!: BookingStatus;

  @Column({ name: 'passenger_count', type: 'int', default: 1 })
  passengerCount!: number;

  @Column({ name: 'special_requests', type: 'text', nullable: true })
  specialRequests!: string | null;

  @Column({ name: 'base_price', type: 'decimal', precision: 12, scale: 2 })
  basePrice!: string;

  @Column({ name: 'total_price', type: 'decimal', precision: 12, scale: 2 })
  totalPrice!: string;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({ name: 'flight_number', type: 'varchar', length: 50, nullable: true })
  flightNumber!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Payment, (payment) => payment.booking)
  payments!: Payment[];
}
