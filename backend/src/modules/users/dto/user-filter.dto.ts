import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '../../../common/enums';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class UserFilterDto extends PaginationDto {
  @ApiPropertyOptional({ enum: Gender, description: 'Filter by gender' })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Minimum age', example: 18 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(18)
  ageMin?: number;

  @ApiPropertyOptional({ description: 'Maximum age', example: 60 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(18)
  ageMax?: number;

  @ApiPropertyOptional({ description: 'Filter by religion' })
  @IsOptional()
  @IsString()
  religion?: string;

  @ApiPropertyOptional({ description: 'Filter by mother tongue' })
  @IsOptional()
  @IsString()
  motherTongue?: string;

  @ApiPropertyOptional({ description: 'Filter by country' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Filter by state' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'Filter by city' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Filter by marital status' })
  @IsOptional()
  @IsString()
  maritalStatus?: string;

  @ApiPropertyOptional({ description: 'Filter by diet' })
  @IsOptional()
  @IsString()
  diet?: string;

  @ApiPropertyOptional({ description: 'Filter by smoking habit' })
  @IsOptional()
  @IsString()
  smoking?: string;

  @ApiPropertyOptional({ description: 'Filter by drinking habit' })
  @IsOptional()
  @IsString()
  drinking?: string;

  @ApiPropertyOptional({ description: 'Minimum annual income' })
  @IsOptional()
  @Type(() => Number)
  minIncome?: number;

  @ApiPropertyOptional({ description: 'Maximum annual income' })
  @IsOptional()
  @Type(() => Number)
  maxIncome?: number;

  @ApiPropertyOptional({ description: 'Only users with at least one photo' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hasPhoto?: boolean;

  @ApiPropertyOptional({ description: 'Only verified users' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({ description: 'Search by name or email' })
  @IsOptional()
  @IsString()
  query?: string;
}
