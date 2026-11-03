/*
    La venta online de una jornada cierra unas horas ANTES de que empiece: de
    ahí en adelante las entradas se venden en la puerta. No cambia el estado de
    la jornada (eso lo decide el organizador): solo deja de ofrecerla online.
*/
export const HORAS_CIERRE_VENTA_ONLINE = 2;

// Una jornada se puede comprar online mientras su inicio sea posterior a este momento
export const limiteVentaOnline = (ahora: Date = new Date()): Date =>
    new Date(ahora.getTime() + HORAS_CIERRE_VENTA_ONLINE * 60 * 60 * 1000);
