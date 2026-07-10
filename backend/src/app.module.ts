import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma/prisma.module'
import { PuntoVentaModule } from './punto-venta/punto-venta.module'
import { UsuariosModule } from './usuarios/usuarios.module'
import { PerfilesModule } from './perfiles/perfiles.module'
import { UsuarioPerfilModule } from './usuario-perfil/usuario-perfil.module'
import { PermisoPerfilModule } from './permiso-perfil/permiso-perfil.module';
import { AuditoriasModule } from './auditorias/auditorias.module';
import { EventosModule } from './eventos/eventos.module';
import { EntradasModule } from './entradas/entradas.module';
import { ClientesModule } from './clientes/clientes.module';
import { OrdenCompraModule } from './orden-compra/orden-compra.module';
import { TicketEventoModule } from './ticket-evento/ticket-evento.module';
import { ReembolsosModule } from './reembolsos/reembolsos.module';
import { AccesosModule } from './accesos/accesos.module';
import { ImagenEventoModule } from './imagen-evento/imagen-evento.module';
import { ProductosModule } from './productos/productos.module';
import { ProductoEventoModule } from './producto-evento/producto-evento.module';
import { VentaBuffetModule } from './venta-buffet/venta-buffet.module';
import { DetalleVentaBuffetModule } from './detalle-venta-buffet/detalle-venta-buffet.module';
import { RubrosModule } from './rubros/rubros.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { ProveedorRubroModule } from './proveedor-rubro/proveedor-rubro.module';
import { MovimientoFinancieroModule } from './movimiento-financiero/movimiento-financiero.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, PuntoVentaModule, UsuariosModule, PerfilesModule, UsuarioPerfilModule, PermisoPerfilModule, AuditoriasModule, EventosModule, EntradasModule, ClientesModule, OrdenCompraModule, TicketEventoModule, ReembolsosModule, AccesosModule, ImagenEventoModule, ProductosModule, ProductoEventoModule, VentaBuffetModule, DetalleVentaBuffetModule, RubrosModule, ProveedoresModule, ProveedorRubroModule, MovimientoFinancieroModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
