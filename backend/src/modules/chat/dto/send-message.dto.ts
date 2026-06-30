import { IsNotEmpty, IsString, IsOptional, IsIn, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({
    description: 'Message content (text for text messages)',
    example: 'Hello! How are you?',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  content: string;

  @ApiProperty({
    description: 'Message type',
    enum: ['text', 'image', 'audio', 'video', 'document'],
    example: 'text',
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['text', 'image', 'audio', 'video', 'document'])
  type: string;

  @ApiProperty({
    description: 'Conversation UUID',
    example: 'conv-uuid-here',
  })
  @IsNotEmpty()
  @IsString()
  conversationId: string;

  @ApiPropertyOptional({
    description: 'Media URL for image/audio/video/document messages',
    example: 'https://bucket.s3.amazonaws.com/uploads/image.jpg',
  })
  @IsOptional()
  @IsString()
  mediaUrl?: string;
}
