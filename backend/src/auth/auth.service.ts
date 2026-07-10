import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService} from '@nestjs/jwt';

import * as bcrypt from 'bcrypt'
import { LoginDto } from './dtos/login.dto';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class AuthService {
    constructor( 
        private userService: UsuariosService, 
        private jwtService: JwtService
    ) {}

    async login(data: LoginDto) {
        //Busco si existe el usuario
        const user = await this.userService.findByUser(data.usuario)

        if (!user){
            throw new UnauthorizedException('Credenciales incorrectas')
        }

        if (user.estado !== 'Activo'){
            throw new UnauthorizedException('Credenciales incorrectas')
        }

        const verifyPassword = await bcrypt.compare(data.password, user.password)

        if (!verifyPassword){
            throw new UnauthorizedException('Credenciales incorrectas')
        }

        await this.userService.updateLastLogin(user.id)
        

        const payload = {sub: user.id, usuario: user.usuario }
        const token = this.jwtService.sign(payload)

        return {
            token,
            user:{
                id: user.id,
                nombre: user.nombre,
                usuario: user.usuario
            }
        }
    }

    async getMe(id: number): Promise<{user: {id: number, nombre: string, usuario: string}, permissions: string[]}> {
        const [user, permissions] = await Promise.all([
            this.userService.findOne(id),
            this.userService.getPermissionsUser(id)
        ])
       

        if (!user){
            throw new UnauthorizedException('Usuario no encontrado')
        }

        return {
            user:{
                id: user.id,
                nombre: user.nombre,
                usuario: user.usuario
            },
            permissions
        }
    }
}
