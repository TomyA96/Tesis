import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsuariosService } from '../../usuarios/usuarios.service';
import { PERMISOS_KEY } from '../decorators/permisos.decorator';


@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usuariosService: UsuariosService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissionsRequired = this.reflector.getAllAndOverride<string[]>(PERMISOS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!permissionsRequired || permissionsRequired.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const userPermissions = await this.usuariosService.getPermissionsUser(request.user.sub);
    const hasAllPermissions = permissionsRequired.every(permission => userPermissions.includes(permission));

    if (!hasAllPermissions) {
      throw new ForbiddenException('No tienes permisos suficientes para acceder a este recurso');
    }

    return true;
  }
}