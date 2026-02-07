import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuoteEntity } from './entities/quote.entity';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { NotificationType, QuoteStatus, ServiceRequestStatus } from '../common/enums';
import { RequestEntity } from '../requests/entities/request.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(QuoteEntity)
    private readonly quotesRepo: Repository<QuoteEntity>,
    @InjectRepository(RequestEntity)
    private readonly requestsRepo: Repository<RequestEntity>,
    private readonly notificationsService: NotificationsService,
  ) {}

  getByRequest(requestId?: string) {
    if (!requestId) {
      return this.quotesRepo.find({ order: { issuedAt: 'DESC' } });
    }
    return this.quotesRepo.find({ where: { requestId } });
  }

  create(dto: CreateQuoteDto) {
    const status = dto.status ?? QuoteStatus.SENT;
    const quote = this.quotesRepo.create({
      ...dto,
      currency: dto.currency ?? 'ZAR',
      status,
    });
    return this.quotesRepo.save(quote).then(async (saved) => {
      const request = await this.requestsRepo.findOne({ where: { id: saved.requestId } });
      if (request) {
        request.hasQuote = true;
        request.quoteId = saved.id;
        request.quoteStatus = saved.status;
        request.requiresQuote = true;
        request.status = ServiceRequestStatus.PENDING;
        if (saved.status === QuoteStatus.SENT) {
          request.quoteSentAt = request.quoteSentAt ?? new Date();
        }
        await this.requestsRepo.save(request);

        if (request.customerId) {
          await this.notificationsService.createNotification({
            userId: request.customerId,
            type: NotificationType.QUOTE_ISSUED,
            message: 'A quote is ready for your approval.',
            metadata: { requestId: request.id },
          });
        }
      }
      return saved;
    });
  }

  async updateStatus(id: string, status: QuoteStatus) {
    const quote = await this.quotesRepo.findOne({ where: { id } });
    if (!quote) throw new NotFoundException('Quote not found');
    quote.status = status;
    if (status === QuoteStatus.ACCEPTED) {
      quote.acceptedAt = new Date();
    }
    const saved = await this.quotesRepo.save(quote);

    const request = await this.requestsRepo.findOne({ where: { id: quote.requestId } });
    if (request) {
      request.quoteStatus = saved.status;
      if (status === QuoteStatus.ACCEPTED) {
        request.requiresQuote = false;
        request.status = ServiceRequestStatus.PENDING;
        request.quoteAcceptedAt = request.quoteAcceptedAt ?? new Date();
      }
      if (status === QuoteStatus.REJECTED) {
        request.quoteRejectedAt = request.quoteRejectedAt ?? new Date();
      }
      if (status === QuoteStatus.SENT) {
        request.quoteSentAt = request.quoteSentAt ?? new Date();
      }
      await this.requestsRepo.save(request);

      if (request.dispatcherId) {
        await this.notificationsService.createNotification({
          userId: request.dispatcherId,
          type: NotificationType.QUOTE_ISSUED,
          message: `Quote ${status.toLowerCase()} by customer.`,
          metadata: { requestId: request.id },
        });
      }
    }

    return saved;
  }
}
