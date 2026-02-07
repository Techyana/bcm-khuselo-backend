import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  record(@Body() dto: CreateTransactionDto) {
    return this.transactionsService.record(dto);
  }

  @Get('recent')
  getRecent(@Query('hours') hours = '12', @Query('types') types?: string) {
    return this.transactionsService.getRecent(Number(hours), types);
  }

  @Get()
  getAll() {
    return this.transactionsService.getAll();
  }
}
