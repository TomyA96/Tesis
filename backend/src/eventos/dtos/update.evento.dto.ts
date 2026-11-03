import { CreateEventoDto } from "./create.evento.dto";
import { OmitType, PartialType } from "@nestjs/mapped-types";

// Solo datos propios del evento: las jornadas se modifican por separado
export class UpdateEventoDto extends PartialType(OmitType(CreateEventoDto, ['jornadas'] as const)) {}
