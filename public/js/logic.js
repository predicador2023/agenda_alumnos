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

export const prepararDatosGraficoSemanal = (ingresosDelMes) => {
    const semanas = {
        'Semana 1': [0, 0, 0, 0, 0, 0],
        'Semana 2': [0, 0, 0, 0, 0, 0],
        'Semana 3': [0, 0, 0, 0, 0, 0],
        'Semana 4': [0, 0, 0, 0, 0, 0]
    };

    ingresosDelMes.forEach(ing => {
        // Forzamos mediodía para evitar errores de zona horaria con la fecha
        const fecha = new Date(ing.fecha + 'T12:00:00');
        const diaDelMes = fecha.getDate();
        const diaSemana = fecha.getDay(); 

        if (diaSemana === 0) return; // Ignoramos domingos

        let nombreSemana;
        if (diaDelMes <= 7) nombreSemana = 'Semana 1';
        else if (diaDelMes <= 14) nombreSemana = 'Semana 2';
        else if (diaDelMes <= 21) nombreSemana = 'Semana 3';
        else nombreSemana = 'Semana 4';

        const indiceDia = diaSemana - 1; 
        // El Number(...) arregla la inconsistencia de los montos
        semanas[nombreSemana][indiceDia] += Number(ing.monto || 0);
    });

    return semanas;
};
 // Agrega esto al final de logic.js si no lo tienes
export const obtenerMesActualFormato = () => {
    const ahora = new Date();
    const anio = ahora.getFullYear(); // 2026
    const mes = String(ahora.getMonth() + 1).padStart(2, '0'); // 01
    return `${anio}-${mes}`;
};