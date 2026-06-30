import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RefundDto {
  @ApiPropertyOptional({ description: 'Reason for refund' })
  @IsString()
  @IsOptional()
  reason?: string;
}
