import {
  IsString, IsOptional, IsNumber, IsObject, IsEnum, Min, Max,
} from 'class-validator';

export class PartnerPreferenceDto {
  @IsOptional()
  @IsNumber()
  @Min(18)
  @Max(100)
  ageMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(18)
  @Max(100)
  ageMax?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  heightMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  heightMax?: number;

  @IsOptional()
  @IsObject()
  maritalStatus?: object;

  @IsOptional()
  @IsObject()
  religion?: object;

  @IsOptional()
  @IsObject()
  caste?: object;

  @IsOptional()
  @IsObject()
  community?: object;

  @IsOptional()
  @IsObject()
  motherTongue?: object;

  @IsOptional()
  @IsObject()
  country?: object;

  @IsOptional()
  @IsObject()
  state?: object;

  @IsOptional()
  @IsObject()
  city?: object;

  @IsOptional()
  @IsObject()
  education?: object;

  @IsOptional()
  @IsObject()
  occupation?: object;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minIncome?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxIncome?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsObject()
  workMode?: object;

  @IsOptional()
  @IsObject()
  technologyStack?: object;

  @IsOptional()
  @IsObject()
  diet?: object;

  @IsOptional()
  @IsObject()
  smoking?: object;

  @IsOptional()
  @IsObject()
  drinking?: object;

  @IsOptional()
  @IsEnum(['yes', 'no', 'any', 'unknown'])
  manglik?: 'yes' | 'no' | 'any' | 'unknown';

  @IsOptional()
  @IsString()
  description?: string;
}
