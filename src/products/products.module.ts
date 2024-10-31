import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModel } from './entities/products.entity';
import { CompaniesModel } from 'src/companies/entities/companies.entity';
import { UsersModel } from 'src/users/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductsModel, CompaniesModel, UsersModel])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
