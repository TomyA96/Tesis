import { Module } from '@nestjs/common';
import { ProveedorRubroController } from './proveedor-rubro.controller';
import { ProveedorRubroService } from './proveedor-rubro.service';

@Module({
  controllers: [ProveedorRubroController],
  providers: [ProveedorRubroService]
})
export class ProveedorRubroModule {}
