import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportQueryDto } from './dto/report-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('overview')
  getOverview(@Request() req, @Query() query: ReportQueryDto) {
    return this.reportsService.getOverview(req.user.userId, query);
  }

  @Get('categories')
  getCategoryBreakdown(@Request() req, @Query() query: ReportQueryDto) {
    return this.reportsService.categoryBreakdown(req.user.userId, query);
  }

  @Get('trend')
  getIncomeVsExpenseTrend(@Request() req, @Query('months') months: number) {
    return this.reportsService.incomeVsExpenseTrend(req.user.userId, Number(months) || 6);
  }

  @Get('budgets')
  getBudgetPerformance(@Request() req, @Query() query: ReportQueryDto) {
    return this.reportsService.budgetPerformance(req.user.userId, query);
  }
}
