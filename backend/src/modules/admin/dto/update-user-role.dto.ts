import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: UserRole, description: 'New user role' })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}
