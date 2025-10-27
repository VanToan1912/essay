import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
    Request,
  } from '@nestjs/common';
  import { DebtsService } from './debts.service';
  import { CreateDebtDto } from './dto/create-debt.dto';
  import { UpdateDebtDto } from './dto/update-debt.dto';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  
  @UseGuards(JwtAuthGuard)
  @Controller('debts')
  export class DebtsController {
    constructor(private readonly debtsService: DebtsService) {}
  
    @Post()
    create(@Request() req, @Body() dto: CreateDebtDto) {
      return this.debtsService.create(req.user.userId, dto);
    }
  
    @Get()
    findAll(@Request() req) {
      return this.debtsService.findAll(req.user.userId);
    }
  
    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
      return this.debtsService.findOne(req.user.userId, id);
    }
  
    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() dto: UpdateDebtDto) {
      return this.debtsService.update(req.user.userId, id, dto);
    }
  
    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
      return this.debtsService.delete(req.user.userId, id);
    }
  
    @Patch(':id/mark-paid')
    markAsPaid(@Request() req, @Param('id') id: string) {
      return this.debtsService.markAsPaid(req.user.userId, id);
    }
  
    @Get('upcoming')
    upcomingDebts(@Request() req, @Query('days') days: number) {
      return this.debtsService.upcomingDebts(req.user.userId, Number(days || 7));
    }
  
    @Get('summary')
    getSummary(@Request() req) {
      return this.debtsService.getSummary(req.user.userId);
    }
  }
  