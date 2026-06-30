import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OAuthProvider } from '../../../common/enums';

export class SocialLoginDto {
  @ApiProperty({ enum: OAuthProvider, example: OAuthProvider.GOOGLE, description: 'OAuth provider' })
  @IsEnum(OAuthProvider)
  @IsNotEmpty()
  provider: OAuthProvider;

  @ApiProperty({ example: 'ya29.a0...', description: 'OAuth access token from provider' })
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @ApiPropertyOptional({ example: 'fcm-device-token', description: 'Device push token' })
  @IsOptional()
  @IsString()
  deviceToken?: string;
}
