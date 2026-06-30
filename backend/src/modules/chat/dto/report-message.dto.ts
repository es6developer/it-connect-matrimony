import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReportMessageDto {
  @ApiProperty({
    description: 'Reason for reporting this message',
    example: 'Inappropriate content',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  reason: string;
}
