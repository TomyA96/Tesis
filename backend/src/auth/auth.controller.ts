import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { AuthGuard } from './guards/auth.guard';



@Controller('auth')
export class AuthController {
    constructor( private authService:AuthService){}


    @Post('login')
    login(@Body() data: LoginDto){
        return this.authService.login(data);
    }

    @UseGuards(AuthGuard)
    @Get('me')
    getMe(@Request() request: any) {
        const { sub: id } = request.user;
        return this.authService.getMe(id);
    }
}
