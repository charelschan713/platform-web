import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Booking } from '../modules/bookings/entities/booking.entity';
import { CorporateAccount } from '../modules/tenants/entities/corporate-account.entity';
import { Driver } from '../modules/drivers/entities/driver.entity';
import { Notification } from '../modules/notifications/entities/notification.entity';
import { Payment } from '../modules/payments/entities/payment.entity';
import { PricingRule } from '../modules/bookings/entities/pricing-rule.entity';
import { Tenant } from '../modules/tenants/entities/tenant.entity';
import { User } from '../modules/users/entities/user.entity';
import { Vehicle } from '../modules/vehicles/entities/vehicle.entity';

export const entities = [
  Tenant,
  User,
  Driver,
  Vehicle,
  CorporateAccount,
  Booking,
  Payment,
  PricingRule,
  Notification,
];

export function dataSourceOptionsFactory(config: ConfigService): DataSourceOptions {
  const ssl = config.get<string>('DB_SSL') === 'true';
  return {
    type: 'postgres',
    host: config.get<string>('DB_HOST', 'localhost'),
    port: Number(config.get<string>('DB_PORT', '5432')),
    username: config.get<string>('DB_USER', 'postgres'),
    password: config.get<string>('DB_PASSWORD', 'postgres'),
    database: config.get<string>('DB_NAME', 'chauffeur_saas'),
    ssl: ssl ? { rejectUnauthorized: false } : false,
    synchronize: config.get<string>('DB_SYNCHRONIZE', 'false') === 'true',
    logging: config.get<string>('DB_LOGGING', 'false') === 'true',
    entities,
    migrations: ['dist/database/migrations/*.js'],
  };
}

const configService = new ConfigService();
const dataSourceOptions = dataSourceOptionsFactory(configService);

export default new DataSource(dataSourceOptions);
