import { Tenant } from 'src/modules/tenants/entities/tenant.entity';
import { VehicleClass } from 'src/modules/vehicles/entities/vehicle.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('pricing_rules')
export class PricingRule {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @Column({ name: 'vehicle_class', type: 'enum', enum: VehicleClass })
  vehicleClass!: VehicleClass;

  @Column({ name: 'base_fare', type: 'decimal', precision: 12, scale: 2 })
  baseFare!: string;

  @Column({ name: 'price_per_km', type: 'decimal', precision: 12, scale: 2 })
  pricePerKm!: string;

  @Column({ name: 'price_per_minute', type: 'decimal', precision: 12, scale: 2 })
  pricePerMinute!: string;

  @Column({ name: 'minimum_fare', type: 'decimal', precision: 12, scale: 2 })
  minimumFare!: string;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
