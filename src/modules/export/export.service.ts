import { Injectable, BadRequestException } from '@nestjs/common';
// import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';
import * as ExcelJS from 'exceljs';
import { CreateExportDto } from './dto/create-export.dto';
import PDFKit from 'pdfkit';

@Injectable()
export class ExportService {
  async export(createExportDto: CreateExportDto): Promise<Buffer> {
    const { data, type, entity } = createExportDto;

    // Validate input
    if (!data || data.length === 0) {
      throw new BadRequestException('No data to export');
    }

    // Generate columns based on entity
    const columns = this.getColumnsByEntity(entity, data[0]);
    const title = this.getTitleByEntity(entity);

    // Export based on type
    return type === 'pdf' 
      ? this.exportToPdf(data, title, columns)
      : this.exportToExcel(data, title, columns);
  }

  private getColumnsByEntity(entity: string, firstItem: any): { header: string; key: string; width?: number }[] {
    switch (entity) {
      case 'tasks':
        return [
          { header: 'Title', key: 'title', width: 30 },
          { header: 'Description', key: 'description', width: 50 },
          { header: 'Due Date', key: 'due_date', width: 15 },
          { header: 'Priority', key: 'priority', width: 10 },
          { header: 'Status', key: 'status', width: 15 },
        ];
      case 'users':
        return [
          { header: 'Name', key: 'name', width: 30 },
          { header: 'Email', key: 'email', width: 50 },
          { header: 'Role', key: 'role', width: 15 },
          { header: 'Status', key: 'status', width: 10 },
        ];
      default:
        // Fallback to dynamic column generation
        return Object.keys(firstItem).map(key => ({
          header: this.capitalizeFirstLetter(key),
          key: key,
          width: 30
        }));
    }
  }

  private getTitleByEntity(entity: string): string {
    switch (entity) {
      case 'tasks': return 'Tasks Export';
      case 'users': return 'Users Export';
      default: return 'Data Export';
    }
  }

  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  private truncateText(text: string, maxLength: number): string {
    return text.length > maxLength 
      ? text.substring(0, maxLength - 3) + '...' 
      : text;
  }

  private wrapText(text: string, maxWidth: number, doc: PDFKit.PDFDocument): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = doc.widthOfString(currentLine + ' ' + word);
      
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    
    lines.push(currentLine);
    return lines;
  }

  private async exportToPdf(
    data: any[], 
    title: string, 
    columns: { header: string; key: string }[]
  ): Promise<Buffer> {
    const doc = new PDFKit({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    // Title
    doc.fontSize(16).text(`${title} Export`, { align: 'center' }).moveDown(1);

    // Table configuration
    const headers = Object.keys(data[0]);
    const tableTop = doc.y;
    const columnWidth = 110; // Slightly increased
    const startX = 50;
    const cellPadding = 5;

    // Function to calculate max row height
    const calculateRowHeight = (row: any) => {
      return Math.max(...headers.map(header => {
        const cellValue = row[header] !== null && row[header] !== undefined 
          ? String(row[header]) 
          : '';
        const wrappedLines = this.wrapText(cellValue, columnWidth - 2*cellPadding, doc);
        return wrappedLines.length * 12; // Approximate line height
      }));
    };

    // Draw headers
    doc.font('Helvetica-Bold');
    headers.forEach((header, i) => {
      doc
        .text(
          header.charAt(0).toUpperCase() + header.slice(1), 
          startX + i * columnWidth, 
          tableTop, 
          { 
            width: columnWidth, 
            align: 'center',
            lineBreak: false
          }
        )
        .strokeColor('#000')
        .lineWidth(1)
        .rect(startX + i * columnWidth, tableTop, columnWidth, 25)
        .stroke();
    });

    // Draw rows
    doc.font('Helvetica');
    let currentY = tableTop + 25;

    data.forEach((row) => {
      const rowHeight = calculateRowHeight(row);

      headers.forEach((header, colIndex) => {
        const cellValue = row[header] !== null && row[header] !== undefined 
          ? String(row[header]) 
          : '';
        
        // Wrap text
        const wrappedLines = this.wrapText(cellValue, columnWidth - 2*cellPadding, doc);
        
        doc
          .text(wrappedLines.join('\n'), 
            startX + colIndex * columnWidth + cellPadding, 
            currentY, 
            { 
              width: columnWidth - 2*cellPadding, 
              align: 'center',
              lineBreak: true
            }
          )
          .strokeColor('#000')
          .lineWidth(0.5)
          .rect(startX + colIndex * columnWidth, currentY - cellPadding, columnWidth, rowHeight + 2*cellPadding)
          .stroke();
      });

      currentY += rowHeight + 2*cellPadding;
    });

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
    });
  }

  private async exportToExcel(
    data: any[], 
    title: string, 
    columns: { header: string; key: string; width?: number }[]
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(title);

    // Set columns
    worksheet.columns = columns;

    // Add data rows
    data.forEach(item => {
      worksheet.addRow(item);
    });

    // Style the first row (headers)
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
