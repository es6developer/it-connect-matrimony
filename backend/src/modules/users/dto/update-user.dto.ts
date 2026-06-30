import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
  Matches,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Gender } from '../../../common/enums';
import { CreateUserDto } from './create-user.dto';

class ProfileUpdateDto {
  @ApiPropertyOptional({ description: 'Profile headline' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  headline?: string;

  @ApiPropertyOptional({ description: 'About me section' })
  @IsOptional()
  @IsString()
  aboutMe?: string;

  @ApiPropertyOptional({ description: 'Short bio' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: '1995-06-15', description: 'Date of birth' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date of birth must be in YYYY-MM-DD format',
  })
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'Marital status' })
  @IsOptional()
  @IsString()
  maritalStatus?: string;

  @ApiPropertyOptional({ description: 'Religion' })
  @IsOptional()
  @IsString()
  religion?: string;

  @ApiPropertyOptional({ description: 'Caste' })
  @IsOptional()
  @IsString()
  caste?: string;

  @ApiPropertyOptional({ description: 'Mother tongue' })
  @IsOptional()
  @IsString()
  motherTongue?: string;

  @ApiPropertyOptional({ description: 'Country' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'State' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Height in cm' })
  @IsOptional()
  height?: number;

  @ApiPropertyOptional({ description: 'Diet preference' })
  @IsOptional()
  @IsString()
  diet?: string;

  @ApiPropertyOptional({ description: 'Smoking habit' })
  @IsOptional()
  @IsString()
  smoking?: string;

  @ApiPropertyOptional({ description: 'Drinking habit' })
  @IsOptional()
  @IsString()
  drinking?: string;
}

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['passwordHash', 'role', 'status', 'isEmailVerified'] as const),
) {
  @ApiPropertyOptional({ type: ProfileUpdateDto, description: 'Profile fields to update' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ProfileUpdateDto)
  profile?: ProfileUpdateDto;
}
