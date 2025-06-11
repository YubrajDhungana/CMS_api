import { Entity,Column,PrimaryGeneratedColumn,CreateDateColumn,UpdateDateColumn,DeleteDateColumn,OneToMany} from "typeorm";
import { Card } from "./card.entity";

@Entity()
export class Category{
    @PrimaryGeneratedColumn()
    id!:number;

    @Column({unique:true})
    name!:string;

    @Column({nullable:true})
    description?:string;

    @CreateDateColumn()
    created_at!:Date;

    @UpdateDateColumn()
    updated_at!:Date;

    @DeleteDateColumn()
    deleted_at?:Date;

    @Column()
    user_id!:number;

    @OneToMany(()=>Card,(card)=>card.category)
    cards!:Card[];
}