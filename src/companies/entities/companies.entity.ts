import { ProductsModel } from 'src/products/entities/products.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class CompaniesModel {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  category: string;

  @Column()
  explanation: string;

  @Column({
    nullable: true,
  })
  image: string;

  @OneToMany(() => ProductsModel, (products) => products.company, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  products: ProductsModel[];
}
