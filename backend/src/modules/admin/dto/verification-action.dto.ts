import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RejectVerificationDto {
  @ApiProperty({ description: 'Rejection reason' })
  @IsString()
  reason: string;
}

export class ApproveVerificationDto {
  @ApiPropertyOptional({ description: 'Optional approval notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
