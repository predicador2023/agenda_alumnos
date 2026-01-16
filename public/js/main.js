import * as api from './api.js';
import * as logic from './logic.js';
import * as ui from './ui.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- BLOQUE 1: LOS QUE YA FUNCIONAN (NO SE TOCAN) ---
    document.getElementById('btn-ingresar').onclick = () => ui.irA('form-section');
    
    document.getElementById('btn-ver-lista').onclick = async () => {
        const datos = await api.obtenerTodosLosIngresos();
        ui.llenarTabla(datos); // Aquí sí queremos la lista completa
        ui.irA('lista-section');
        const visor = document.getElementById('visor-total-rapido');
        if (visor) visor.classList.add('hidden');
    };

    // --- BLOQUE 2: VER MES ACTUAL (SOLO MONTO) ---
    const btnMesActual = document.getElementById('btn-mes-actual-inicio');
    if (btnMesActual) {
        btnMesActual.onclick = async () => {
            try {
                const datos = await api.obtenerTodosLosIngresos();
                const total = logic.calcularTotalMesActual(datos);
                
                // 1. Preparamos el monto
                ui.prepararMontoSinMostrar(total);
                
                // 2. Limpiamos la tabla para que NO se vea la lista
                const tabla = document.getElementById('tabla-ingresos');
                if (tabla) tabla.innerHTML = ""; 
                
                // 3. Mostramos la sección (que ahora tendrá el visor pero tabla vacía)
                ui.mostrarSeccionMonto();
            } catch (error) {
                console.error("Error en Mes Actual:", error);
            }
        };
    }

    // --- BLOQUE 3: HISTORIAL (EL QUE YA FUNCIONA) ---
    const btnHistorial = document.getElementById('btn-historial-inicio');
    if (btnHistorial) {
        btnHistorial.onclick = async () => {
            try {
                const datos = await api.obtenerTodosLosIngresos();
                const agrupados = logic.agruparPagosPorAñoYMes(datos);
                
                ui.dibujarHistorial(agrupados, async (mesSeleccionado) => {
                    const filtrados = logic.filtrarPorMesEspecifico(datos, mesSeleccionado);
                    ui.llenarTabla(filtrados);
                    ui.irA('lista-section');
                    const visor = document.getElementById('visor-total-rapido');
                    if (visor) visor.classList.add('hidden');
                });
                
                ui.irA('historial-section');
            } catch (error) {
                console.error("Error en Historial:", error);
            }
        };
    }
});