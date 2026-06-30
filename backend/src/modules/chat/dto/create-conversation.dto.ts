import { IsNotEmpty, IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({
    description: 'UUID of the user to start conversation with',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsNotEmpty()
  @IsString()
  participantId: string;

  @ApiPropertyOptional({
    description: 'Initial message to send',
    example: 'Hi there!',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  initialMessage?: string;
}
