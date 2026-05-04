import type { ReactNode } from "react";

export type Column<T extends {id: number | string}> = {
  key: keyof T;        //esta key tiene que ser uno de los campos que existen en T   
  label: string;          
  render?: (value: T[keyof T], row: T) => ReactNode; 
};