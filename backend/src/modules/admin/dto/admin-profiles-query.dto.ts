import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class AdminProfilesQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by hideProfile status' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hidden?: boolean;

  @ApiPropertyOptional({ description: 'Search by headline, bio, city' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by religion' })
  @IsOptional()
  @IsString()
  religion?: string;

  @ApiPropertyOptional({ description: 'Filter by city' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Filter by country' })
  @IsOptional()
  @IsString()
  country?: string;
}
