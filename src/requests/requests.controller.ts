import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { AssignRequestDto } from './dto/assign-request.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { FeedbackDto } from './dto/feedback.dto';

@Controller('service-requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get()
  findAll(
    @Query('customerId') customerId?: string,
    @Query('engineerId') engineerId?: string,
  ) {
    return this.requestsService.findAll({ customerId, engineerId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requestsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateRequestDto) {
    return this.requestsService.create(dto);
  }

  @Post(':id/assign')
  assign(@Param('id') id: string, @Body() dto: AssignRequestDto) {
    return this.requestsService.assign(id, dto.engineerId, dto.dispatcherId);
  }

  @Post(':id/unassign')
  unassign(@Param('id') id: string) {
    return this.requestsService.unassign(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.requestsService.updateStatus(id, dto);
  }

  @Post(':id/feedback')
  submitFeedback(@Param('id') id: string, @Body() dto: FeedbackDto) {
    return this.requestsService.submitFeedback(id, dto);
  }

  @Post(':id/attachments')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = 'uploads/requests';
          if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadAttachment(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const url = `/uploads/requests/${file.filename}`;
    return this.requestsService.addAttachment(id, url);
  }
}
