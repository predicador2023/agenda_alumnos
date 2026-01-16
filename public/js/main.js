// js/main.js
import * as api from './api.js';
import * as logic from './logic.js';
import * as ui from './ui.js';

let editandoID = null;

/**
 * COORDINADOR CENTRAL
 * Esta función orquesta qué datos se piden y cómo se muestran.
 */
async function ejecutarCarga(modo = 'nada') {
    const datos = await api.obtenerTodosLosIngresos();
    
    // 1. Actualizar el Historial (Lógica + UI)
    const agrupado = logic.agruparPagosPorAñoYMes(datos);
    ui.dibujarHistorial(agrupado, (mesSeleccionado) => {
        window.mesSeleccionado = mesSeleccionado;
        ui.irA('lista-section');
        ejecutarCarga('historial-mes');
    });

    // 2. Procesar el Monto del Mes Actual
    const totalMes = logic.calcularTotalMesActual(datos);

    // 3. Lógica de Modos (Tus botones)
    if (modo === 'monto-solo') {
        ui.prepararEscenarioMonto(totalMes);
    } 
    else if (modo === 'lista-completa') {
        const visorCont = document.getElementById('visor-total-rapido');
        if (visorCont) visorCont.classList.add('hidden');
        
        const tabla = document.getElementById('tabla-ingresos');
        tabla.innerHTML = '';
        datos.forEach(i => ui.renderizarFila(i, tabla));
    } 
    else if (modo === 'historial-mes') {
        const tabla = document.getElementById('tabla-ingresos');
        tabla.innerHTML = '';
        const filtrados = logic.filtrarPorMesEspecifico(datos, window.mesSeleccionado);
        filtrados.forEach(i => ui.renderizarFila(i, tabla));
    }
}

// INICIALIZACIÓN DE EVENTOS
document.addEventListener('DOMContentLoaded', () => {

    // Botón: Ver Mes Actual
    document.getElementById('btn-mes-actual-inicio').onclick = () => {
        ui.irA('lista-section'); 
        ejecutarCarga('monto-solo'); 
    };

    // Botón: Ver Lista Completa
    document.getElementById('btn-ver-lista').onclick = () => {
        ui.irA('lista-section');
        ejecutarCarga('lista-completa');
    };

    // Botón: Historial
    document.getElementById('btn-historial-inicio').onclick = () => {
        ui.irA('historial-section');
        ejecutarCarga('nada'); 
    };

    // Botón: Formulario de Ingreso
    document.getElementById('btn-ingresar').onclick = () => {
        editandoID = null;
        document.getElementById('form-alumno').reset();
        ui.irA('form-section');
    };

    // Manejo del Formulario (Guardar/Editar)
    document.getElementById('form-alumno').onsubmit = async (e) => {
        e.preventDefault();
        const datosForm = {
            nombre_alumno: document.getElementById('nombre').value,
            monto: document.getElementById('monto').value,
            fecha: document.getElementById('fecha').value,
            tipo: document.getElementById('tipo').value
        };
        const exito = await api.guardarIngreso(datosForm, editandoID);
        if (exito) location.reload();
    };

    ejecutarCarga('nada'); 
});

// FUNCIONES GLOBALES (Necesarias para los onclick del HTML)
window.prepararEdicion = (id, nombre, monto, fecha, tipo) => {
    editandoID = id;
    document.getElementById('nombre').value = nombre;
    document.getElementById('monto').value = monto;
    document.getElementById('fecha').value = fecha;
    document.getElementById('tipo').value = tipo;
    ui.irA('form-section');
};

window.borrarRegistro = async (id) => {
    if (confirm("¿Eliminar?")) {
        const exito = await api.eliminarIngreso(id);
        if (exito) location.reload();
    }
};