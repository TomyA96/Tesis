import {CanActivate, ExecutionContext, Injectable, UnauthorizedException, } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UsuariosService } from '../../usuarios/usuarios.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usuariosService: UsuariosService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    let payload;
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Token inválido');
    }

    const usuario = await this.usuariosService.findOne(payload.sub);
    /*
      Mismo criterio que el login: solo entra un usuario Activo. Así, pasar a
      alguien a Inactivo o Bloqueado le corta también la sesión que ya tenía
      abierta, sin esperar a que venza el token (8 h).
    */
    if (!usuario || usuario.estado !== 'Activo') {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    request['user'] = payload;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authorization = request.headers.authorization;

    if (!authorization) {
      return undefined;
    }
    
    const [type, token] = authorization.split(' ');

    return type === 'Bearer' ? token : undefined;
  }
}