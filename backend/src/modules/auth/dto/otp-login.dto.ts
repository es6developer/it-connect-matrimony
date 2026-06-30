import { IsString, IsNotEmpty, Length, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OtpLoginDto {
  @ApiProperty({ example: '+919876543210', description: 'Phone number' })
  @IsPhoneNumber(null)
  @IsNotEmpty()
  phone: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+919876543210', description: 'Phone number' })
  @IsPhoneNumber(null)
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP code' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;
}
