import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
    Request,
  } from '@nestjs/common';
  import { BudgetsService } from './budgets.service';
  import { CreateBudgetDto } from './dto/create-budget.dto';
  import { UpdateBudgetDto } from './dto/update-budget.dto';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  
  @UseGuards(JwtAuthGuard)
  @Controller('budgets')
  export class BudgetsController {
    constructor(private readonly budgetsService: BudgetsService) {}
  
    @Post()
    create(@Request() req, @Body() dto: CreateBudgetDto) {
      return this.budgetsService.create(req.user.userId, dto);
    }
  
    @Get()
    findAll(@Request() req) {
      return this.budgetsService.findAll(req.user.userId);
    }
  
    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
      return this.budgetsService.findOne(req.user.userId, id);
    }
  
    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() dto: UpdateBudgetDto) {
      return this.budgetsService.update(req.user.userId, id, dto);
    }
  
    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
      return this.budgetsService.delete(req.user.userId, id);
    }
  
    @Get('track/all')
    trackBudgets(@Request() req) {
      return this.budgetsService.trackBudgets(req.user.userId);
    }
  }
  