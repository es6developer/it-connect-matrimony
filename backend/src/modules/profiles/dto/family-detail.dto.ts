import { IsString, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { FamilyType, FamilyStatus, FamilyValues } from '../../../common/enums';

export class FamilyDetailDto {
  @IsOptional()
  @IsString()
  fatherName?: string;

  @IsOptional()
  @IsString()
  fatherOccupation?: string;

  @IsOptional()
  @IsString()
  motherName?: string;

  @IsOptional()
  @IsString()
  motherOccupation?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  siblingsCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  brotherCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sisterCount?: number;

  @IsOptional()
  @IsEnum(FamilyType)
  familyType?: FamilyType;

  @IsOptional()
  @IsEnum(FamilyStatus)
  familyStatus?: FamilyStatus;

  @IsOptional()
  @IsEnum(FamilyValues)
  familyValues?: FamilyValues;

  @IsOptional()
  @IsString()
  familyLocation?: string;

  @IsOptional()
  @IsString()
  aboutFamily?: string;
}
