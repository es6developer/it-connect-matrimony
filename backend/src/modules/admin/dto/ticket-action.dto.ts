import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketStatus } from '../../../common/enums';

export class AssignTicketDto {
  @ApiProperty({ description: 'Admin UUID to assign the ticket to' })
  @IsNotEmpty()
  @IsString()
  adminId: string;
}

export class UpdateTicketStatusDto {
  @ApiProperty({ enum: TicketStatus })
  @IsNotEmpty()
  @IsString()
  status: TicketStatus;
}

export class ReplyTicketDto {
  @ApiProperty({ description: 'Reply message' })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Attachment URLs' })
  @IsOptional()
  attachments?: string[];
}
