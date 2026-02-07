import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { PartEntity } from './entities/part.entity';
import { PartTransactionEntity } from './entities/part-transaction.entity';
import { CreatePartDto } from './dto/create-part.dto';
import { PartStatus, PartTransactionType } from '../common/enums';

@Injectable()
export class PartsService {
  constructor(
    @InjectRepository(PartEntity)
    private readonly partsRepo: Repository<PartEntity>,
    @InjectRepository(PartTransactionEntity)
    private readonly txRepo: Repository<PartTransactionEntity>,
  ) {}

  getAll() {
    return this.partsRepo.find({ order: { createdAt: 'DESC' } });
  }

  async create(dto: CreatePartDto) {
    const part = this.partsRepo.create({
      ...dto,
      status: PartStatus.AVAILABLE,
      availableQuantity: dto.quantity,
    });
    return this.partsRepo.save(part);
  }

  async claim(id: string, userId?: string) {
    const part = await this.partsRepo.findOne({ where: { id } });
    if (!part) throw new NotFoundException('Part not found');

    part.availableQuantity = Math.max(0, part.availableQuantity - 1);
    part.status = part.availableQuantity === 0 ? PartStatus.UNAVAILABLE : PartStatus.CLAIMED;
    const saved = await this.partsRepo.save(part);

    if (userId) {
      await this.txRepo.save(
        this.txRepo.create({
          partId: part.id,
          userId,
          type: PartTransactionType.CLAIM,
          quantityDelta: 1,
        }),
      );
    }

    return saved;
  }

  async requestPart(id: string, userId?: string) {
    const part = await this.partsRepo.findOne({ where: { id } });
    if (!part) throw new NotFoundException('Part not found');

    part.status = PartStatus.UNAVAILABLE;
    const saved = await this.partsRepo.save(part);

    if (userId) {
      await this.txRepo.save(
        this.txRepo.create({
          partId: part.id,
          userId,
          type: PartTransactionType.REQUEST,
          quantityDelta: 1,
        }),
      );
    }

    return saved;
  }

  async collect(id: string, userId?: string) {
    const part = await this.partsRepo.findOne({ where: { id } });
    if (!part) throw new NotFoundException('Part not found');

    part.status = PartStatus.COLLECTED;
    part.collectedAt = new Date();
    const saved = await this.partsRepo.save(part);

    if (userId) {
      await this.txRepo.save(
        this.txRepo.create({
          partId: part.id,
          userId,
          type: PartTransactionType.COLLECT,
          quantityDelta: 1,
        }),
      );
    }

    return saved;
  }

  async returnPart(id: string, _reason: string, userId?: string) {
    const part = await this.partsRepo.findOne({ where: { id } });
    if (!part) throw new NotFoundException('Part not found');

    part.availableQuantity = part.availableQuantity + 1;
    part.status = PartStatus.AVAILABLE;
    part.claimedByName = null;
    part.claimedAt = null;
    part.collectedAt = null;
    const saved = await this.partsRepo.save(part);

    if (userId) {
      await this.txRepo.save(
        this.txRepo.create({
          partId: part.id,
          userId,
          type: PartTransactionType.RETURN,
          quantityDelta: 1,
        }),
      );
    }

    return saved;
  }

  async remove(id: string, _reason: string) {
    const part = await this.partsRepo.findOne({ where: { id } });
    if (!part) throw new NotFoundException('Part not found');
    await this.partsRepo.delete(id);
    return { success: true };
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
