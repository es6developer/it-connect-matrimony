import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Setup2faDto {
  @ApiProperty({ example: '123456', description: 'TOTP token to confirm setup' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  token: string;
}

export class Verify2faDto {
  @ApiProperty({ example: '123456', description: 'TOTP token' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  token: string;
}

export class Disable2faDto {
  @ApiProperty({ description: 'Current password for verification' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
