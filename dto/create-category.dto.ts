// src/dto/create-category.dto.ts
import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name!: string;

  @IsInt()
  user_id!: number;

  @IsString()
  @IsOptional()
  description?: string;
}