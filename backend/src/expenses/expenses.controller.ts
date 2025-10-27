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
  import { ExpensesService } from './expenses.service';
  import { CreateExpenseDto } from './dto/create-expense.dto';
  import { UpdateExpenseDto } from './dto/update-expense.dto';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  
  @UseGuards(JwtAuthGuard)
  @Controller('expenses')
  export class ExpensesController {
    constructor(private readonly expensesService: ExpensesService) {}
  
    @Post()
    create(@Request() req, @Body() dto: CreateExpenseDto) {
      return this.expensesService.create(req.user.userId, dto);
    }
  
    @Get()
    findAll(@Request() req) {
      return this.expensesService.findAll(req.user.userId);
    }
  
    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
      return this.expensesService.findOne(req.user.userId, id);
    }
  
    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() dto: UpdateExpenseDto) {
      return this.expensesService.update(req.user.userId, id, dto);
    }
  
    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
      return this.expensesService.delete(req.user.userId, id);
    }
  
    @Get('tag/:tag')
    findByTag(@Request() req, @Param('tag') tag: string) {
      return this.expensesService.findByTag(req.user.userId, tag);
    }
  
    @Get('history/latest')
    viewHistory(@Request() req, @Query('limit') limit?: number) {
      return this.expensesService.viewHistory(req.user.userId, Number(limit) || 10);
    }
  }
  