import * as api from './api.js';
import * as logic from './logic.js';
import * as ui from './ui.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- BLOQUE 1: NAVEGACIÓN Y LISTA ---
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

    // --- BLOQUE 4: GUARDAR O ACTUALIZAR REGISTRO ---
    const formAlumno = document.getElementById('form-alumno');
    if (formAlumno) {
        formAlumno.onsubmit = async (e) => {
            e.preventDefault(); 

            // Verificamos si hay un ID guardado (esto nos dice si es EDICIÓN)
            const editId = formAlumno.dataset.editId;

            const datosAlumno = {
                nombre_alumno: document.getElementById('nombre').value,
                tipo: document.getElementById('tipo').value,
                monto: parseFloat(document.getElementById('monto').value),
                fecha: document.getElementById('fecha').value
            };

            try {
                // Si editId tiene valor, la API hará un UPDATE. Si es null, un INSERT.
                const exito = await api.guardarIngreso(datosAlumno, editId);

                if (exito) {
                    alert(editId ? "✅ Registro actualizado con éxito" : "✅ Registro guardado con éxito");
                    
                    // Limpiamos el rastro de la edición
                    delete formAlumno.dataset.editId;
                    formAlumno.reset();
                    
                    // Restauramos el botón a su estado original
                    const btnGuardar = formAlumno.querySelector('button[type="submit"]');
                    if (btnGuardar) btnGuardar.innerText = "Guardar Ingreso 💰";

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

// --- FUNCIONES GLOBALES (FUERA DEL DOM PARA QUE EL HTML LAS VEA) ---

window.borrarRegistro = async (id) => {
    if (confirm("¿Estás seguro de que querés borrar este registro?")) {
        const exito = await api.eliminarIngreso(id);
        if (exito) {
            alert("✅ Registro eliminado");
            location.reload(); 
        } else {
            alert("❌ Error: No se pudo borrar de la base de datos.");
        }
    }
};

window.prepararEdicion = async (id) => {
    try {
        const ingresos = await api.obtenerTodosLosIngresos();
        const item = ingresos.find(ing => ing.id == id);

        if (item) {
            // 1. Cargamos los datos en los inputs
            document.getElementById('nombre').value = item.nombre_alumno || item.nombre || '';
            document.getElementById('monto').value = item.monto;
            document.getElementById('fecha').value = item.fecha;
            document.getElementById('tipo').value = item.tipo;
            
            // 2. IMPORTANTE: Guardamos el ID en el dataset del formulario
            const form = document.getElementById('form-alumno');
            form.dataset.editId = id;
            
            // 3. Llevamos al usuario a la pantalla del formulario
            ui.irA('form-section');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // 4. Cambiamos visualmente el botón
            const btnGuardar = form.querySelector('button[type="submit"]');
            if (btnGuardar) btnGuardar.innerText = "Actualizar Registro 💾";
        }
    } catch (error) {
        console.error("Error al preparar la edición:", error);
    }
};