import { IsString, IsOptional, IsEnum } from 'class-validator';

export class HoroscopeDetailDto {
  @IsOptional()
  @IsString()
  birthPlace?: string;

  @IsOptional()
  @IsString()
  birthTime?: string;

  @IsOptional()
  @IsString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  rashi?: string;

  @IsOptional()
  @IsString()
  nakshatra?: string;

  @IsOptional()
  @IsEnum(['yes', 'no', 'unknown'])
  manglik?: 'yes' | 'no' | 'unknown';

  @IsOptional()
  @IsString()
  gotra?: string;

  @IsOptional()
  @IsString()
  kundaliFile?: string;
}
