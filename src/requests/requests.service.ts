import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestEntity } from './entities/request.entity';
import { RequestUpdateEntity } from './entities/request-update.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { FeedbackDto } from './dto/feedback.dto';
import { NotificationType, Role, ServiceRequestPriority, ServiceRequestStatus, ServiceRequestType } from '../common/enums';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(RequestEntity)
    private readonly requestsRepo: Repository<RequestEntity>,
    @InjectRepository(RequestUpdateEntity)
    private readonly updatesRepo: Repository<RequestUpdateEntity>,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private isQuoteRequired(type: ServiceRequestType) {
    return [
      ServiceRequestType.TONER,
      ServiceRequestType.IT_SUPPORT,
      ServiceRequestType.SOFTWARE,
      ServiceRequestType.BILLING_QUERY,
    ].includes(type);
  }

  findAll(filter: { customerId?: string; engineerId?: string }) {
    const where: Record<string, string> = {};
    if (filter.customerId) where.customerId = filter.customerId;
    if (filter.engineerId) where.assignedEngineerId = filter.engineerId;
    return this.requestsRepo.find({
      where,
      relations: ['updates'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const request = await this.requestsRepo.findOne({
      where: { id },
      relations: ['updates'],
    });
    if (!request) throw new NotFoundException('Request not found');
    return request;
  }

  async create(dto: CreateRequestDto) {
    const requiresQuote = this.isQuoteRequired(dto.type);
    const customer = await this.usersService.findById(dto.customerId);
    const request = this.requestsRepo.create({
      ...dto,
      status: requiresQuote ? ServiceRequestStatus.PENDING : ServiceRequestStatus.NEW,
      priority: dto.priority ?? ServiceRequestPriority.MEDIUM,
      isPriorityClient: dto.isPriorityClient ?? false,
      customerCreditHold: customer?.creditHold ?? dto.customerCreditHold ?? false,
      requiresQuote,
      hasQuote: false,
      quoteRequestedAt: requiresQuote ? new Date() : undefined,
    });
    const saved = await this.requestsRepo.save(request);

    const update = this.updatesRepo.create({
      requestId: saved.id,
      status: saved.status,
      comment: requiresQuote ? 'Request received. Quote required.' : 'Request submitted',
    });
    await this.updatesRepo.save(update);

    const dispatchers = await this.usersService.findByRole(Role.DISPATCHER);
    await Promise.all(
      dispatchers.map((d) =>
        this.notificationsService.createNotification({
          userId: d.id,
          type: NotificationType.REQUEST_CREATED,
          message: `New request from ${saved.customerName}`,
          metadata: { requestId: saved.id },
        }),
      ),
    );

    await this.notificationsService.createNotification({
      userId: saved.customerId,
      type: NotificationType.REQUEST_CREATED,
      message: 'Your request has been received.',
      metadata: { requestId: saved.id },
    });

    return this.findOne(saved.id);
  }

  async assign(requestId: string, engineerId: string, dispatcherId?: string) {
    const request = await this.findOne(requestId);
    if (request.requiresQuote && request.quoteStatus !== 'ACCEPTED') {
      throw new BadRequestException('Quote approval required before assignment');
    }
    const engineer = await this.usersService.findById(engineerId);

    request.assignedEngineerId = engineerId;
    request.assignedTechnicianName = engineer ? `${engineer.name} ${engineer.surname}` : undefined;
    request.dispatcherId = dispatcherId ?? request.dispatcherId;
    request.status = ServiceRequestStatus.ASSIGNED;
    request.assignedAt = request.assignedAt ?? new Date();
    if (dispatcherId) {
      request.dispatcherAssignedAt = request.dispatcherAssignedAt ?? new Date();
    }

    await this.requestsRepo.save(request);
    await this.updatesRepo.save(
      this.updatesRepo.create({
        requestId,
        status: ServiceRequestStatus.ASSIGNED,
        comment: `Dispatcher assigned to ${request.assignedTechnicianName || engineerId}`,
        technicianName: request.assignedTechnicianName,
      }),
    );

    if (request.customerId) {
      await this.notificationsService.createNotification({
        userId: request.customerId,
        type: NotificationType.REQUEST_ASSIGNED,
        message: `Your request has been assigned to ${request.assignedTechnicianName || 'an engineer'}.`,
        metadata: { requestId },
      });
    }
    if (engineerId) {
      await this.notificationsService.createNotification({
        userId: engineerId,
        type: NotificationType.REQUEST_ASSIGNED,
        message: `New assigned call: ${request.customerName}`,
        metadata: { requestId },
      });
    }

    return this.findOne(requestId);
  }

  async unassign(requestId: string) {
    const request = await this.findOne(requestId);
    request.assignedEngineerId = null;
    request.assignedTechnicianName = null;
    request.status = ServiceRequestStatus.PENDING;

    await this.requestsRepo.save(request);
    await this.updatesRepo.save(
      this.updatesRepo.create({
        requestId,
        status: ServiceRequestStatus.PENDING,
        comment: 'Dispatcher removed assignment',
      }),
    );

    if (request.customerId) {
      await this.notificationsService.createNotification({
        userId: request.customerId,
        type: NotificationType.REQUEST_STATUS_UPDATED,
        message: 'Your request is pending reassignment.',
        metadata: { requestId },
      });
    }

    return this.findOne(requestId);
  }

  async updateStatus(requestId: string, dto: UpdateStatusDto) {
    const request = await this.findOne(requestId);
    request.status = dto.status;
    const now = new Date();
    switch (dto.status) {
      case ServiceRequestStatus.ACKNOWLEDGED:
        request.acknowledgedAt = request.acknowledgedAt ?? now;
        break;
      case ServiceRequestStatus.EN_ROUTE:
        request.enRouteAt = request.enRouteAt ?? now;
        break;
      case ServiceRequestStatus.ON_SITE:
        request.onSiteAt = request.onSiteAt ?? now;
        break;
      case ServiceRequestStatus.WAITING_PARTS:
        request.waitingPartsAt = request.waitingPartsAt ?? now;
        break;
      case ServiceRequestStatus.WAITING_CUSTOMER:
        request.waitingCustomerAt = request.waitingCustomerAt ?? now;
        break;
      case ServiceRequestStatus.COMPLETED:
        request.completedAt = request.completedAt ?? now;
        break;
      case ServiceRequestStatus.CANCELLED:
        request.cancelledAt = request.cancelledAt ?? now;
        break;
      default:
        break;
    }
    await this.requestsRepo.save(request);

    await this.updatesRepo.save(
      this.updatesRepo.create({
        requestId,
        status: dto.status,
        comment: dto.comment,
        technicianName: dto.technicianName,
      }),
    );

    if (request.customerId) {
      await this.notificationsService.createNotification({
        userId: request.customerId,
        type: NotificationType.REQUEST_STATUS_UPDATED,
        message: `Status updated: ${dto.status.replace(/_/g, ' ')}`,
        metadata: { requestId },
      });
    }
    if (request.dispatcherId) {
      await this.notificationsService.createNotification({
        userId: request.dispatcherId,
        type: NotificationType.REQUEST_STATUS_UPDATED,
        message: `Request ${request.id} updated to ${dto.status.replace(/_/g, ' ')}`,
        metadata: { requestId },
      });
    }

    return this.findOne(requestId);
  }

  async submitFeedback(requestId: string, dto: FeedbackDto) {
    const request = await this.findOne(requestId);
    request.feedback = {
      rating: dto.rating,
      comment: dto.comment,
      submittedAt: new Date().toISOString(),
    };
    await this.requestsRepo.save(request);

    if (request.dispatcherId) {
      await this.notificationsService.createNotification({
        userId: request.dispatcherId,
        type: NotificationType.GENERAL,
        message: `Customer left feedback on request ${request.id}.`,
        metadata: { requestId },
      });
    }
    return this.findOne(requestId);
  }

  async addAttachment(requestId: string, url: string) {
    const request = await this.findOne(requestId);
    await this.updatesRepo.save(
      this.updatesRepo.create({
        requestId,
        status: request.status,
        comment: 'Attachment uploaded',
        photos: [url],
      }),
    );
    return { url };
  }
}
