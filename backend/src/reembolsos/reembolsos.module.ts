import { Module } from '@nestjs/common';
import { ReembolsosController } from './reembolsos.controller';
import { ReembolsosService } from './reembolsos.service';

@Module({
  controllers: [ReembolsosController],
  providers: [ReembolsosService]
})
export class ReembolsosModule {}
