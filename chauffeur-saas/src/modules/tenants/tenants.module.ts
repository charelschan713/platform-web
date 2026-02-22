import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorporateAccount } from './entities/corporate-account.entity';
import { Tenant } from './entities/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, CorporateAccount])],
  exports: [TypeOrmModule],
})
export class TenantsModule {}
