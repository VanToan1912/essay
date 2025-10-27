import { IsIn, IsOptional, IsDateString, ValidateIf } from 'class-validator';

export class ReportQueryDto {
  @IsIn(['monthly', 'yearly', 'custom'])
  type: string;

  @ValidateIf(o => o.type === 'custom')
  @IsDateString()
  startDate?: string;

  @ValidateIf(o => o.type === 'custom')
  @IsDateString()
  endDate?: string;
}
