import { CompaniesModel } from 'src/companies/entities/companies.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ProductsModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true,
  })
  companyName: string;

  @Column()
  isProduct: boolean;

  @Column()
  menu: string;

  @Column()
  price: number;

  @Column()
  explanation: string;

  @Column({
    nullable: true,
  })
  allergy: string;

  @Column()
  isVegan: boolean;

  @Column()
  isHalal: boolean;

  @Column()
  category: string;

  @Column()
  isSpicy: boolean;

  @Column()
  isHot: boolean;

  @Column({
    nullable: true,
  })
  image: string;

  @Column({
    nullable: true,
  })
  link: string;

  @ManyToOne(() => CompaniesModel, (company) => company.products)
  company: CompaniesModel;
}

/**
 * Products Entity properties
 *
 *
 */
