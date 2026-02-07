import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { PartTransactionEntity } from '../parts/entities/part-transaction.entity';
import { TonerTransactionEntity } from '../toners/entities/toner-transaction.entity';
import { PartEntity } from '../parts/entities/part.entity';
import { TonerEntity } from '../toners/entities/toner.entity';
import { UserEntity } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PartTransactionEntity,
      TonerTransactionEntity,
      PartEntity,
      TonerEntity,
      UserEntity,
    ]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
