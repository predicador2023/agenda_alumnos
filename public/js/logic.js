// js/logic.js

/**
 * Filtra los datos para obtener el mes actual y suma los montos.
 * Corresponde a tu lógica de 'CÁLCULO DEL MES ACTUAL'.
 */
export function calcularTotalMesActual(datos) {
    const ahora = new Date();
    const mesActualRef = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
    
    const soloMesActual = datos.filter(i => i.fecha && i.fecha.includes(mesActualRef));
    return soloMesActual.reduce((acc, curr) => acc + (parseFloat(curr.monto) || 0), 0);
}

/**
 * Organiza los datos para el menú desplegable.
 * Corresponde a tu función 'actualizarHistorialDinamico'.
 */
export function agruparPagosPorAñoYMes(datos) {
    const ahora = new Date();
    const mesActualRef = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
    const historialAgrupado = {};
    
    datos.forEach(i => {
        const mesAnio = i.fecha ? i.fecha.slice(0, 7) : "";
        const anio = i.fecha ? i.fecha.slice(0, 4) : "";
        
        // Solo meses anteriores al actual
        if (mesAnio !== "" && mesAnio < mesActualRef) {
            if (!historialAgrupado[anio]) historialAgrupado[anio] = new Set();
            historialAgrupado[anio].add(mesAnio);
        }
    });

    return historialAgrupado;
}

/**
 * Filtra la lista por el mes que el usuario elija en el historial.
 */
export function filtrarPorMesEspecifico(datos, mesSeleccionado) {
    return datos.filter(i => i.fecha && i.fecha.includes(mesSeleccionado));
}