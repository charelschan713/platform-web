import { Booking } from 'src/modules/bookings/entities/booking.entity';
import { Driver } from 'src/modules/drivers/entities/driver.entity';
import { Tenant } from 'src/modules/tenants/entities/tenant.entity';
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

export enum VehicleClass {
  BUSINESS = 'BUSINESS',
  FIRST = 'FIRST',
  VAN = 'VAN',
  ELECTRIC = 'ELECTRIC',
}

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'driver_id', type: 'uuid' })
  driverId!: string;

  @ManyToOne(() => Driver, (driver) => driver.vehicles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'driver_id' })
  driver!: Driver;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.vehicles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @Column({ type: 'varchar', length: 100 })
  make!: string;

  @Column({ type: 'varchar', length: 100 })
  model!: string;

  @Column({ type: 'int' })
  year!: number;

  @Column({ type: 'varchar', length: 50 })
  color!: string;

  @Column({ name: 'plate_number', type: 'varchar', length: 30, unique: true })
  plateNumber!: string;

  @Column({ name: 'vehicle_class', type: 'enum', enum: VehicleClass })
  vehicleClass!: VehicleClass;

  @Column({ type: 'int' })
  capacity!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Booking, (booking) => booking.vehicle)
  bookings!: Booking[];
}
