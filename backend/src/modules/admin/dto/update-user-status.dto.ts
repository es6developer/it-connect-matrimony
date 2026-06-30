import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '../../../common/enums';

export class UpdateUserStatusDto {
  @ApiProperty({ enum: UserStatus, description: 'New user status' })
  @IsNotEmpty()
  @IsEnum(UserStatus)
  status: UserStatus;
}
