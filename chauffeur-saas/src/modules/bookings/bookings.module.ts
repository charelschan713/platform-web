import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { PricingRule } from './entities/pricing-rule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, PricingRule])],
  exports: [TypeOrmModule],
})
export class BookingsModule {}
