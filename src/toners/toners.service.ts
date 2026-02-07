import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { TonerEntity } from './entities/toner.entity';
import { TonerTransactionEntity } from './entities/toner-transaction.entity';
import { CreateTonerDto } from './dto/create-toner.dto';
import { ClaimTonerDto } from './dto/claim-toner.dto';
import { CollectTonerDto } from './dto/collect-toner.dto';
import { PartTransactionType } from '../common/enums';

@Injectable()
export class TonersService {
  constructor(
    @InjectRepository(TonerEntity)
    private readonly tonersRepo: Repository<TonerEntity>,
    @InjectRepository(TonerTransactionEntity)
    private readonly txRepo: Repository<TonerTransactionEntity>,
  ) {}

  getAll() {
    return this.tonersRepo.find({ order: { createdAt: 'DESC' } });
  }

  create(dto: CreateTonerDto) {
    const toner = this.tonersRepo.create(dto);
    return this.tonersRepo.save(toner);
  }

  async claim(id: string, dto: ClaimTonerDto) {
    const toner = await this.tonersRepo.findOne({ where: { id } });
    if (!toner) throw new NotFoundException('Toner not found');

    toner.stock = Math.max(0, toner.stock - 1);
    toner.claimedByName = dto.claimedBy;
    toner.claimedAt = new Date();
    toner.requestedByName = dto.clientName ?? toner.requestedByName;
    toner.serialNumber = dto.serialNumber ?? toner.serialNumber;

    const saved = await this.tonersRepo.save(toner);

    if (dto.userId) {
      await this.txRepo.save(
        this.txRepo.create({
          tonerId: toner.id,
          userId: dto.userId,
          type: PartTransactionType.CLAIM,
          quantityDelta: 1,
        }),
      );
    }

    return saved;
  }

  async requestToner(id: string) {
    const toner = await this.tonersRepo.findOne({ where: { id } });
    if (!toner) throw new NotFoundException('Toner not found');
    toner.requestedAtTimestamp = new Date();
    const saved = await this.tonersRepo.save(toner);
    return saved;
  }

  async collect(id: string, dto: CollectTonerDto) {
    const toner = await this.tonersRepo.findOne({ where: { id } });
    if (!toner) throw new NotFoundException('Toner not found');

    toner.collected = true;
    toner.collectedByName = dto.collectedBy;
    toner.collectedAt = new Date();

    const saved = await this.tonersRepo.save(toner);

    if (dto.userId) {
      await this.txRepo.save(
        this.txRepo.create({
          tonerId: toner.id,
          userId: dto.userId,
          type: PartTransactionType.COLLECT,
          quantityDelta: 1,
        }),
      );
    }

    return saved;
  }

  getRecentTransactions(hours: number) {
    const since = new Date(Date.now() - hours * 3600 * 1000);
    return this.txRepo.find({ where: { createdAt: MoreThan(since) } });
  }

  getRecentCollections(hours: number) {
    const since = new Date(Date.now() - hours * 3600 * 1000);
    return this.txRepo.find({
      where: { createdAt: MoreThan(since), type: PartTransactionType.COLLECT },
    });
  }
}
