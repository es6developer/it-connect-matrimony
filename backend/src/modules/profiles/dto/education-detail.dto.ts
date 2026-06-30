import { IsString, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';

export class EducationDetailDto {
  @IsOptional()
  @IsString()
  degree?: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsString()
  university?: string;

  @IsOptional()
  @IsString()
  college?: string;

  @IsOptional()
  @IsNumber()
  @Min(1950)
  yearOfPassing?: number;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsBoolean()
  isHighestDegree?: boolean;
}
