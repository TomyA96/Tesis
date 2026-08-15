import { CreateEventoDto } from "./create.evento.dto";
import { PartialType } from "@nestjs/mapped-types";

export class UpdateEventoDto extends PartialType(CreateEventoDto){}