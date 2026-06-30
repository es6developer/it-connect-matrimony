import {
  IsString, IsOptional, IsNumber, IsEnum, IsBoolean, IsObject, Min,
} from 'class-validator';
import { WorkMode } from '../../../common/enums';

export class ProfessionalDetailDto {
  @IsOptional()
  @IsString()
  currentCompany?: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  yearsOfExperience?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentSalary?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  expectedSalary?: number;

  @IsOptional()
  @IsObject()
  technologyStack?: object;

  @IsOptional()
  @IsObject()
  skills?: object;

  @IsOptional()
  @IsEnum(WorkMode)
  workMode?: WorkMode;

  @IsOptional()
  @IsObject()
  preferredCountries?: object;

  @IsOptional()
  @IsString()
  visaStatus?: string;

  @IsOptional()
  @IsString()
  workPermit?: string;

  @IsOptional()
  @IsBoolean()
  isStartupEmployee?: boolean;

  @IsOptional()
  @IsBoolean()
  isEntrepreneur?: boolean;

  @IsOptional()
  @IsString()
  startupName?: string;

  @IsOptional()
  @IsString()
  startupDescription?: string;

  @IsOptional()
  @IsString()
  githubUrl?: string;

  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  portfolioUrl?: string;

  @IsOptional()
  @IsString()
  resumeUrl?: string;

  @IsOptional()
  @IsString()
  noticePeriod?: string;
}
