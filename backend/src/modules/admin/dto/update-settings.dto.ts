import { IsOptional, IsNotEmptyObject, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ description: 'Settings key-value pairs' })
  @IsOptional()
  @IsNotEmptyObject()
  @IsObject()
  settings?: Record<string, any>;
}
