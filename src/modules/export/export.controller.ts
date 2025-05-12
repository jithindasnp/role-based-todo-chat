import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ExportService } from './export.service';
import { CreateExportDto } from './dto/create-export.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('export')
@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post()
  @ApiOperation({ summary: 'Export data to PDF or Excel' })
  @ApiResponse({ status: 200, description: 'Successful export' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async exportData(
    @Body() createExportDto: CreateExportDto,
    @Res() res: Response,
  ) {
    const buffer = await this.exportService.export(createExportDto);

    // Set headers based on export type
    if (createExportDto.type === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${createExportDto.entity}_export.pdf`);
    } else {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${createExportDto.entity}_export.xlsx`);
    }

    res.send(buffer);
  }
}
