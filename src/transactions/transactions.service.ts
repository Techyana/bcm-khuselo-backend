import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThan } from 'typeorm';
import { PartTransactionEntity } from '../parts/entities/part-transaction.entity';
import { TonerTransactionEntity } from '../toners/entities/toner-transaction.entity';
import { PartEntity } from '../parts/entities/part.entity';
import { TonerEntity } from '../toners/entities/toner.entity';
import { UserEntity } from '../users/entities/user.entity';
import { PartTransactionType } from '../common/enums';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(PartTransactionEntity)
    private readonly partTxRepo: Repository<PartTransactionEntity>,
    @InjectRepository(TonerTransactionEntity)
    private readonly tonerTxRepo: Repository<TonerTransactionEntity>,
    @InjectRepository(PartEntity)
    private readonly partsRepo: Repository<PartEntity>,
    @InjectRepository(TonerEntity)
    private readonly tonersRepo: Repository<TonerEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
  ) {}

  private normalizeType(dto: CreateTransactionDto): PartTransactionType {
    const raw = (dto.action ?? dto.type ?? '').toString().trim().toUpperCase();
    if (!raw) throw new BadRequestException('Transaction type is required');
    const map: Record<string, PartTransactionType> = {
      CLAIM: PartTransactionType.CLAIM,
      COLLECT: PartTransactionType.COLLECT,
      REQUEST: PartTransactionType.REQUEST,
      RETURN: PartTransactionType.RETURN,
      ADD: PartTransactionType.ADD,
    };
    if (!map[raw]) throw new BadRequestException('Invalid transaction type');
    return map[raw];
  }

  async record(dto: CreateTransactionDto) {
    if (!dto.partId && !dto.tonerId) {
      throw new BadRequestException('partId or tonerId is required');
    }
    const user = await this.usersRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const type = this.normalizeType(dto);
    const quantityDelta = dto.quantityDelta ?? 1;

    if (dto.partId) {
      const part = await this.partsRepo.findOne({ where: { id: dto.partId } });
      if (!part) throw new NotFoundException('Part not found');

      const tx = this.partTxRepo.create({
        partId: part.id,
        userId: user.id,
        type,
        quantityDelta,
      });
      return this.partTxRepo.save(tx);
    }

    if (dto.tonerId) {
      const toner = await this.tonersRepo.findOne({ where: { id: dto.tonerId } });
      if (!toner) throw new NotFoundException('Toner not found');

      if (type === PartTransactionType.CLAIM) {
        toner.stock = Math.max(0, toner.stock - 1);
        toner.claimedByName = user.name;
        toner.claimedAt = new Date();
        toner.requestedByName = dto.clientName ?? toner.requestedByName;
        toner.serialNumber = dto.serialNumber ?? toner.serialNumber;
      }

      if (type === PartTransactionType.COLLECT) {
        toner.collected = true;
        toner.collectedByName = user.name;
        toner.collectedAt = new Date();
      }

      if (type === PartTransactionType.REQUEST) {
        toner.requestedAtTimestamp = new Date();
        toner.requestedByName = dto.clientName ?? toner.requestedByName;
      }

      await this.tonersRepo.save(toner);

      const tx = this.tonerTxRepo.create({
        tonerId: toner.id,
        userId: user.id,
        type,
        quantityDelta,
      });
      return this.tonerTxRepo.save(tx);
    }

    throw new BadRequestException('Invalid transaction payload');
  }

  async getRecent(hours = 12, types?: string) {
    const since = new Date(Date.now() - hours * 3600 * 1000);
    const typeList = types
      ? types
          .split(',')
          .map((t) => t.trim().toUpperCase())
          .filter(Boolean)
      : [];

    const typeFilter = typeList.length
      ? { type: In(typeList as PartTransactionType[]) }
      : {};

    const [partTx, tonerTx] = await Promise.all([
      this.partTxRepo.find({
        where: { createdAt: MoreThan(since), ...typeFilter },
        order: { createdAt: 'DESC' },
      }),
      this.tonerTxRepo.find({
        where: { createdAt: MoreThan(since), ...typeFilter },
        order: { createdAt: 'DESC' },
      }),
    ]);

    return [...partTx, ...tonerTx].sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async getAll() {
    const [partTx, tonerTx] = await Promise.all([
      this.partTxRepo.find({ order: { createdAt: 'DESC' } }),
      this.tonerTxRepo.find({ order: { createdAt: 'DESC' } }),
    ]);
    return [...partTx, ...tonerTx].sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
}
