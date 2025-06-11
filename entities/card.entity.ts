import { Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Category } from "./category.entity";

@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Category, category => category.cards)
  category!: Category;
}
