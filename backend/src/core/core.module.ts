// src/core/core.module.ts
import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports: [AuthModule],
  exports: [AuthModule],
})
export class CoreModule {}