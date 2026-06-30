import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReportStatusDto {
  @ApiProperty({ enum: ['investigated', 'resolved', 'dismissed'] })
  @IsNotEmpty()
  @IsString()
  status: string;

  @ApiPropertyOptional({ description: 'Resolution notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class TakeReportActionDto {
  @ApiProperty({ enum: ['warn', 'suspend', 'ban', 'dismiss'] })
  @IsNotEmpty()
  @IsString()
  action: string;

  @ApiProperty({ description: 'Reason for action' })
  @IsNotEmpty()
  @IsString()
  reason: string;
}
