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
  import { IncomesService } from './incomes.service';
  import { CreateIncomeDto } from './dto/create-income.dto';
  import { UpdateIncomeDto } from './dto/update-income.dto';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  
  @UseGuards(JwtAuthGuard)
  @Controller('incomes')
  export class IncomesController {
    constructor(private readonly incomesService: IncomesService) {}
  
    @Post()
    create(@Request() req, @Body() dto: CreateIncomeDto) {
      return this.incomesService.create(req.user.userId, dto);
    }
  
    @Get()
    findAll(@Request() req) {
      return this.incomesService.findAll(req.user.userId);
    }
  
    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
      return this.incomesService.findOne(req.user.userId, id);
    }
  
    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() dto: UpdateIncomeDto) {
      return this.incomesService.update(req.user.userId, id, dto);
    }
  
    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
      return this.incomesService.delete(req.user.userId, id);
    }
  
    @Get('tag/:tag')
    findByTag(@Request() req, @Param('tag') tag: string) {
      return this.incomesService.findByTag(req.user.userId, tag);
    }
  
    @Get('source/:source')
    findBySource(@Request() req, @Param('source') source: string) {
      return this.incomesService.findBySource(req.user.userId, source);
    }
  
    @Get('summary/monthly')
    getMonthlySummary(
      @Request() req,
      @Query('year') year: number,
      @Query('month') month: number,
    ) {
      return this.incomesService.getMonthlySummary(
        req.user.userId,
        Number(year),
        Number(month),
      );
    }
  }
  