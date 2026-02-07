import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TonersController } from './toners.controller';
import { TonersService } from './toners.service';
import { TonerEntity } from './entities/toner.entity';
import { TonerTransactionEntity } from './entities/toner-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TonerEntity, TonerTransactionEntity])],
  controllers: [TonersController],
  providers: [TonersService],
})
export class TonersModule {}
