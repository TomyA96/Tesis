import { IsString, IsNotEmpty } from "class-validator";
export class LoginDto {
    @IsNotEmpty()
    @IsString()
    usuario!: string;
    @IsNotEmpty()
    @IsString()
    password!:string;
}