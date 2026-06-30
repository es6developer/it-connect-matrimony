import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { Ticket } from '../../database/entities/ticket.entity';
import { TicketReply } from '../../database/entities/ticket-reply.entity';
import { User } from '../../database/entities/user.entity';
import { AdminTicketsQueryDto } from './dto/admin-tickets-query.dto';
import { AssignTicketDto, UpdateTicketStatusDto, ReplyTicketDto } from './dto/ticket-action.dto';
import { TicketStatus, TicketPriority } from '../../common/enums';
import { ERROR_CODES } from '../../common/constants';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces';

@ApiTags('Admin - Tickets')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/tickets')
export class TicketsController {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(TicketReply)
    private readonly ticketReplyRepository: Repository<TicketReply>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all support tickets' })
  @ApiResponse({ status: 200, description: 'Tickets retrieved' })
  async listTickets(@Query() query: AdminTicketsQueryDto) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC', status, priority, category, assignedTo, dateFrom, dateTo } = query;
    const skip = (page - 1) * limit;

    const qb = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.user', 'user')
      .leftJoinAndSelect('ticket.assignedToUser', 'assignedToUser');

    if (status) qb.andWhere('ticket.status = :status', { status });
    if (priority) qb.andWhere('ticket.priority = :priority', { priority });
    if (category) qb.andWhere('ticket.category = :category', { category });
    if (assignedTo) {
      const adminUser = await this.userRepository.findOne({ where: { uuid: assignedTo } });
      if (adminUser) qb.andWhere('ticket.assignedTo = :assignedTo', { assignedTo: adminUser.id });
    }
    if (dateFrom) qb.andWhere('ticket.createdAt >= :dateFrom', { dateFrom: new Date(dateFrom) });
    if (dateTo) qb.andWhere('ticket.createdAt <= :dateTo', { dateTo: new Date(dateTo) });

    const allowedSortFields = ['createdAt', 'updatedAt', 'status', 'priority', 'subject'];
    const orderField = allowedSortFields.includes(sortBy) ? `ticket.${sortBy}` : 'ticket.createdAt';

    qb.orderBy(orderField, sortOrder).skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: 'Tickets retrieved successfully',
      data,
      meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get ticket details with replies' })
  @ApiResponse({ status: 200, description: 'Ticket details retrieved' })
  async getTicket(@Param('id') id: string) {
    const ticket = await this.ticketRepository.findOne({
      where: { uuid: id },
      relations: ['user', 'assignedToUser', 'replies', 'replies.user'],
    });

    if (!ticket) {
      throw new NotFoundException({
        success: false,
        message: 'Ticket not found',
        error: ERROR_CODES.NOT_FOUND,
        statusCode: 404,
      });
    }

    return {
      success: true,
      message: 'Ticket details retrieved successfully',
      data: ticket,
    };
  }

  @Patch(':id/assign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign ticket to an admin' })
  @ApiResponse({ status: 200, description: 'Ticket assigned' })
  async assignTicket(@Param('id') id: string, @Body() dto: AssignTicketDto) {
    const ticket = await this.ticketRepository.findOne({ where: { uuid: id } });

    if (!ticket) {
      throw new NotFoundException({
        success: false,
        message: 'Ticket not found',
        error: ERROR_CODES.NOT_FOUND,
        statusCode: 404,
      });
    }

    const adminUser = await this.userRepository.findOne({ where: { uuid: dto.adminId } });
    if (!adminUser) {
      throw new NotFoundException({
        success: false,
        message: 'Admin user not found',
        error: ERROR_CODES.USER_NOT_FOUND,
        statusCode: 404,
      });
    }

    ticket.assignedTo = adminUser.id;
    if (ticket.status === TicketStatus.OPEN) {
      ticket.status = TicketStatus.IN_PROGRESS;
    }
    await this.ticketRepository.save(ticket);

    return {
      success: true,
      message: 'Ticket assigned successfully',
    };
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update ticket status' })
  @ApiResponse({ status: 200, description: 'Ticket status updated' })
  async updateTicketStatus(@Param('id') id: string, @Body() dto: UpdateTicketStatusDto) {
    const ticket = await this.ticketRepository.findOne({ where: { uuid: id } });

    if (!ticket) {
      throw new NotFoundException({
        success: false,
        message: 'Ticket not found',
        error: ERROR_CODES.NOT_FOUND,
        statusCode: 404,
      });
    }

    ticket.status = dto.status;
    if (dto.status === TicketStatus.RESOLVED) {
      ticket.resolvedAt = new Date();
    }
    await this.ticketRepository.save(ticket);

    return {
      success: true,
      message: `Ticket status updated to ${dto.status}`,
    };
  }

  @Post(':id/reply')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Reply to a ticket' })
  @ApiResponse({ status: 201, description: 'Reply added' })
  async replyToTicket(
    @Param('id') id: string,
    @Body() dto: ReplyTicketDto,
    @CurrentUser() admin: JwtPayload,
  ) {
    const ticket = await this.ticketRepository.findOne({ where: { uuid: id } });

    if (!ticket) {
      throw new NotFoundException({
        success: false,
        message: 'Ticket not found',
        error: ERROR_CODES.NOT_FOUND,
        statusCode: 404,
      });
    }

    const adminUser = await this.userRepository.findOne({ where: { uuid: admin.sub } });

    const reply = this.ticketReplyRepository.create({
      ticketId: ticket.id,
      userId: adminUser?.id,
      message: dto.message,
      attachments: dto.attachments || null,
    });

    await this.ticketReplyRepository.save(reply);

    if (ticket.status === TicketStatus.OPEN || ticket.status === TicketStatus.REOPENED) {
      ticket.status = TicketStatus.IN_PROGRESS;
      await this.ticketRepository.save(ticket);
    }

    return {
      success: true,
      message: 'Reply added to ticket',
      data: reply,
    };
  }
}
