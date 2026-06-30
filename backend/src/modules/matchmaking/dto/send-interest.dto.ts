import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SendInterestDto {
  @ApiPropertyOptional({ description: 'Personal message to accompany the interest' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
