import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { TonersService } from './toners.service';
import { CreateTonerDto } from './dto/create-toner.dto';
import { ClaimTonerDto } from './dto/claim-toner.dto';
import { CollectTonerDto } from './dto/collect-toner.dto';
import { RequestTonerDto } from './dto/request-toner.dto';

@Controller('toners')
export class TonersController {
  constructor(private readonly tonersService: TonersService) {}

  @Get()
  getAll() {
    return this.tonersService.getAll();
  }

  @Post()
  create(@Body() dto: CreateTonerDto) {
    return this.tonersService.create(dto);
  }

  @Patch(':id/claim')
  claim(@Param('id') id: string, @Body() dto: ClaimTonerDto) {
    return this.tonersService.claim(id, dto);
  }

  @Post(':id/request')
  request(@Param('id') id: string, @Body() _dto: RequestTonerDto) {
    return this.tonersService.requestToner(id);
  }

  @Patch(':id/collect')
  collect(@Param('id') id: string, @Body() dto: CollectTonerDto) {
    return this.tonersService.collect(id, dto);
  }

  @Get('transactions/recent')
  getRecentTransactions(@Query('hours') hours = '12') {
    return this.tonersService.getRecentTransactions(Number(hours));
  }

  @Get('transactions/collected')
  getRecentCollections(@Query('hours') hours = '12') {
    return this.tonersService.getRecentCollections(Number(hours));
  }
}
