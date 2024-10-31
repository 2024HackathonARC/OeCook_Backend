import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesModel } from './entities/companies.entity';
import { ProductsModel } from 'src/products/entities/products.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CompaniesModel, ProductsModel])],
  controllers: [CompaniesController],
  providers: [CompaniesService],
})
export class CompaniesModule {}
