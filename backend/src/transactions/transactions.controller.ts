import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Request,
    UseGuards,
  } from '@nestjs/common';
  import { TransactionsService } from './transactions.service';
  import { CreateTransactionDto } from './dto/create-transaction.dto';
  import { UpdateTransactionDto } from './dto/update-transaction.dto';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  
  @UseGuards(JwtAuthGuard)
  @Controller('transactions')
  export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) {}
  
    @Post()
    create(@Request() req, @Body() dto: CreateTransactionDto) {
      return this.transactionsService.create(req.user.userId, dto);
    }
  
    @Get()
    findAll(@Request() req) {
      return this.transactionsService.findAll(req.user.userId);
    }
  
    @Get('summary')
    getSummary(@Request() req) {
      return this.transactionsService.getSummary(req.user.userId);
    }
  
    @Get('categories')
    getByCategory(@Request() req) {
      return this.transactionsService.getByCategory(req.user.userId);
    }
  
    @Get('filter')
    filterByDate(
      @Request() req,
      @Query('start') start: string,
      @Query('end') end: string,
    ) {
      return this.transactionsService.filterByDate(req.user.userId, start, end);
    }
  
    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
      return this.transactionsService.findOne(req.user.userId, id);
    }
  
    @Patch(':id')
    update(
      @Request() req,
      @Param('id') id: string,
      @Body() dto: UpdateTransactionDto,
    ) {
      return this.transactionsService.update(req.user.userId, id, dto);
    }
  
    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
      return this.transactionsService.remove(req.user.userId, id);
    }
  }
  