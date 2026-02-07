import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartsController } from './parts.controller';
import { PartsService } from './parts.service';
import { PartEntity } from './entities/part.entity';
import { PartTransactionEntity } from './entities/part-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PartEntity, PartTransactionEntity])],
  controllers: [PartsController],
  providers: [PartsService],
})
export class PartsModule {}
