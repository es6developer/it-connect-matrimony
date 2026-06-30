import {
  IsString, IsOptional, IsDateString, IsEnum, IsNumber,
  IsBoolean, Min, Max, IsDecimal,
} from 'class-validator';
import { Gender, MaritalStatus, Diet, Smoking, Drinking } from '../../../common/enums';

export class BasicProfileDto {
  @IsOptional()
  @IsString()
  headline?: string;

  @IsOptional()
  @IsString()
  aboutMe?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsNumber()
  @Min(18)
  @Max(100)
  age?: number;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  @IsOptional()
  @IsString()
  religion?: string;

  @IsOptional()
  @IsString()
  caste?: string;

  @IsOptional()
  @IsString()
  subCaste?: string;

  @IsOptional()
  @IsString()
  community?: string;

  @IsOptional()
  @IsString()
  motherTongue?: string;

  @IsOptional()
  @IsDecimal()
  height?: number;

  @IsOptional()
  @IsDecimal()
  weight?: number;

  @IsOptional()
  @IsString()
  bodyType?: string;

  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @IsOptional()
  @IsString()
  disability?: string;

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
  country?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsBoolean()
  hideProfile?: boolean;

  @IsOptional()
  @IsBoolean()
  hidePhotos?: boolean;

  @IsOptional()
  @IsBoolean()
  hideContact?: boolean;

  @IsOptional()
  @IsBoolean()
  privateMode?: boolean;
}
