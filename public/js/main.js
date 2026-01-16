import * as api from './api.js';
import * as logic from './logic.js';
import * as ui from './ui.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- BLOQUE 1: LOS QUE YA FUNCIONAN (NO SE TOCAN) ---
    document.getElementById('btn-ingresar').onclick = () => ui.irA('form-section');
    
    document.getElementById('btn-ver-lista').onclick = async () => {
        const datos = await api.obtenerTodosLosIngresos();
        ui.llenarTabla(datos); 
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
                
                ui.prepararMontoSinMostrar(total);
                
                const tabla = document.getElementById('tabla-ingresos');
                if (tabla) tabla.innerHTML = ""; 
                
                ui.mostrarSeccionMonto();
            } catch (error) {
                console.error("Error en Mes Actual:", error);
            }
        };
    }

    // --- BLOQUE 3: HISTORIAL ---
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

    // --- BLOQUE 4: GUARDAR NUEVO REGISTRO (EL CAMBIO SOLICITADO) ---
    const formAlumno = document.getElementById('form-alumno');
    if (formAlumno) {
        formAlumno.onsubmit = async (e) => {
            e.preventDefault(); 

            // Recolectamos datos del formulario
            const nuevoAlumno = {
                nombre_alumno: document.getElementById('nombre').value,
                tipo: document.getElementById('tipo').value,
                monto: parseFloat(document.getElementById('monto').value),
                fecha: document.getElementById('fecha').value
            };

            try {
                // Enviamos a tu función guardarIngreso de api.js
                const exito = await api.guardarIngreso(nuevoAlumno);

                if (exito) {
                    alert("✅ Registro guardado con éxito");
                    formAlumno.reset();
                    // Recargamos para que impacte en el historial y el mes actual
                    location.reload(); 
                } else {
                    alert("❌ No se pudo guardar. Revisa la consola.");
                }
            } catch (err) {
                console.error("Error al procesar el guardado:", err);
                alert("Hubo un error en la comunicación con la base de datos.");
            }
        };
    }
});

// --- CONEXIÓN PARA EL BOTÓN DE BORRAR ---
window.borrarRegistro = async (id) => {
    // 1. Preguntamos al usuario
    if (confirm("¿Estás seguro de que querés borrar este registro?")) {
        
        // 2. Llamamos a la función de la API para borrar
        const exito = await api.eliminarIngreso(id);
        
        // 3. Si salió bien, avisamos y recargamos
        if (exito) {
            alert("✅ Registro eliminado");
            location.reload(); 
        } else {
            alert("❌ Error: No se pudo borrar de la base de datos.");
        }
    }
};