import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

export enum Language {
  KOREAN = 'korean',
  CHINESE = 'chinese',
  JAPANESE = 'japanese',
  ENGLISH = 'english',
}

@Entity()
export class UsersModel {
  @PrimaryColumn()
  id: number;

  @Column()
  nickname: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Language,
    default: Language.KOREAN,
  })
  language: Language;

  @Column({
    nullable: true,
  })
  allergy: string;

  @Column()
  isVegan: boolean;

  @Column()
  isHalal: boolean;
}
