import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { Diet, Smoking, Drinking } from '../../../common/enums';

export class LifestyleDetailDto {
  @IsOptional()
  @IsEnum(Diet)
  diet?: Diet;

  @IsOptional()
  @IsEnum(Smoking)
  smoking?: Smoking;

  @IsOptional()
  @IsEnum(Drinking)
  drinking?: Drinking;

  @IsOptional()
  @IsString()
  exerciseFrequency?: string;

  @IsOptional()
  @IsObject()
  hobbies?: object;

  @IsOptional()
  @IsObject()
  interests?: object;

  @IsOptional()
  @IsString()
  fitnessRoutine?: string;

  @IsOptional()
  @IsString()
  sleepingHabits?: string;
}
