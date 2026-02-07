import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { PartsService } from './parts.service';
import { CreatePartDto } from './dto/create-part.dto';
import { RemovePartDto } from './dto/remove-part.dto';
import { ReturnPartDto } from './dto/return-part.dto';

type OptionalUserBody = { userId?: string };

@Controller('parts')
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Get()
  getAll() {
    return this.partsService.getAll();
  }

  @Post()
  create(@Body() dto: CreatePartDto) {
    return this.partsService.create(dto);
  }

  @Post(':id/claim')
  claim(@Param('id') id: string, @Body() body?: OptionalUserBody) {
    return this.partsService.claim(id, body?.userId);
  }

  @Post(':id/request')
  requestPart(@Param('id') id: string, @Body() body?: OptionalUserBody) {
    return this.partsService.requestPart(id, body?.userId);
  }

  @Post(':id/collect')
  collect(@Param('id') id: string, @Body() body?: OptionalUserBody) {
    return this.partsService.collect(id, body?.userId);
  }

  @Post(':id/return')
  returnPart(@Param('id') id: string, @Body() dto: ReturnPartDto) {
    return this.partsService.returnPart(id, dto.reason);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Body() dto: RemovePartDto) {
    return this.partsService.remove(id, dto.reason);
  }

  @Get('transactions/recent')
  getRecentTransactions(@Query('hours') hours = '12') {
    return this.partsService.getRecentTransactions(Number(hours));
  }

  @Get('transactions/collected')
  getRecentCollections(@Query('hours') hours = '12') {
    return this.partsService.getRecentCollections(Number(hours));
  }
}
