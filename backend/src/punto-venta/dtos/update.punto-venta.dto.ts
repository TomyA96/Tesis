import { PartialType } from '@nestjs/mapped-types';
import { CreatePuntoVentaDto } from './create.punto-venta.dto';

export class UpdatePuntoVentaDto extends PartialType(CreatePuntoVentaDto) {}
