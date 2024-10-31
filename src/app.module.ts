import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModel } from './users/entities/users.entity';
import { ProductsModule } from './products/products.module';
import { CompaniesModule } from './companies/companies.module';
import { ProductsModel } from './products/entities/products.entity';
import { CompaniesModel } from './companies/entities/companies.entity';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      username: 'eunho',
      password: '1234',
      database: 'oecook',
      entities: [UsersModel, ProductsModel, CompaniesModel],
      synchronize: true,
    }),
    ProductsModule,
    CompaniesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
