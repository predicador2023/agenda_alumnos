// CONFIGURACIÓN DE SUPABASE
const SB_URL = "https://blmmnlruluciiusilvvm.supabase.co";
const SB_KEY = "sb_publishable_8V-tVlYCibGqYxZa9i_dlQ_t7Ir71aL"; 
const HEADERS = { 
    "apikey": SB_KEY, 
    "Authorization": `Bearer ${SB_KEY}`, 
    "Content-Type": "application/json", 
    "Prefer": "return=representation" 
};

let editandoID = null;

/**
 * NAVEGACIÓN: Cambia entre las secciones de la app
 */
function irA(pantallaId) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    document.getElementById(pantallaId).classList.remove('hidden');
    // Si entramos a la lista, refrescamos los datos automáticamente
    if (pantallaId === 'lista-section') cargarDesdeSupabase();
}

/**
 * CARGA DE DATOS: Obtiene registros, calcula enero y llena la tabla
 */
async function cargarDesdeSupabase(filtro = 'todos') {
    const tabla = document.getElementById('tabla-ingresos');
    const visorMontoInicio = document.getElementById('monto-total-dinamico');
    
    try {
        const res = await fetch(`${SB_URL}/rest/v1/ingresos?select=*&order=fecha.desc`, { headers: HEADERS });
        const datos = await res.json();
        
        if (!tabla) return;
        tabla.innerHTML = ''; 
        let sumaEnero = 0;

        datos.forEach(i => {
            const esEnero = i.fecha && i.fecha.includes('2026-01');
            
            // Lógica de filtrado: si pedimos 'anteriores', ocultamos enero
            if (filtro === 'anteriores' && esEnero) return;
            
            const montoNum = parseFloat(i.monto) || 0;
            if (esEnero) sumaEnero += montoNum;

            // Inyectamos la fila (Sin totales al final, solo datos)
            tabla.innerHTML += `
                <tr>
                    <td>
                        <span class="nombre-tabla">${i.nombre_alumno || 'Sin Nombre'}</span>
                        <span class="info-sub-tabla">${i.fecha} • <b>${i.tipo || 'diario'}</b></span>
                    </td>
                    <td class="monto-positivo">
                        $${montoNum.toLocaleString('es-AR')}
                    </td>
                    <td>
                        <div style="display:flex; gap:12px; justify-content:flex-end;">
                            <span onclick="prepararEdicion('${i.id}','${i.nombre_alumno}','${i.monto}','${i.fecha}','${i.tipo}')" style="cursor:pointer; font-size:18px;">✏️</span>
                            <span onclick="borrarRegistro('${i.id}')" style="cursor:pointer; font-size:18px;">🗑️</span>
                        </div>
                    </td>
                </tr>
            `;
        });

        // Actualizamos el Visor de Inicio con Animación
        if (visorMontoInicio) {
            visorMontoInicio.classList.remove('animar-entrada');
            visorMontoInicio.innerText = `$ ${sumaEnero.toLocaleString('es-AR')}`;
            // Reinicio de animación
            void visorMontoInicio.offsetWidth; 
            visorMontoInicio.classList.add('animar-entrada');
        }
        
    } catch (err) { 
        console.error("Error en la carga:", err); 
    }
}

/**
 * EDICIÓN: Carga los datos de un registro en el formulario
 */
window.prepararEdicion = (id, nombre, monto, fecha, tipo) => {
    editandoID = id;
    document.getElementById('nombre').value = nombre;
    document.getElementById('monto').value = monto;
    document.getElementById('fecha').value = fecha;
    document.getElementById('tipo').value = tipo || 'Diario';
    irA('form-section');
    document.querySelector('.btn-guardar').innerText = "Actualizar Registro";
};

/**
 * ELIMINACIÓN: Borra registro de la base de datos
 */
window.borrarRegistro = async (id) => {
    if (!confirm("¿Eliminar este pago definitivamente?")) return;
    await fetch(`${SB_URL}/rest/v1/ingresos?id=eq.${id}`, { method: 'DELETE', headers: HEADERS });
    cargarDesdeSupabase();
};

/**
 * INICIALIZACIÓN: Configura botones y envío de formulario
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // Botón para ir al formulario (Crear nuevo)
    document.getElementById('btn-ingresar').onclick = () => {
        editandoID = null;
        document.getElementById('form-alumno').reset();
        document.querySelector('.btn-guardar').innerText = "Guardar Registro";
        irA('form-section');
    };
    
    // Botón Ver Lista completo
    document.getElementById('btn-ver-lista').onclick = () => irA('lista-section');
    
    // Botón Mes Actual (Inicio)
    document.getElementById('btn-mes-actual-inicio').onclick = () => {
        document.getElementById('visor-total-rapido').classList.remove('hidden');
        cargarDesdeSupabase();
    };

    // Botón Historial (Inicio)
    document.getElementById('btn-historial-inicio').onclick = () => {
        irA('lista-section');
        cargarDesdeSupabase('anteriores');
    };

    // Envío del Formulario (Guardar/Editar)
    const form = document.getElementById('form-alumno');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const datos = {
            nombre_alumno: document.getElementById('nombre').value,
            monto: document.getElementById('monto').value,
            fecha: document.getElementById('fecha').value,
            tipo: document.getElementById('tipo').value
        };

        let url = `${SB_URL}/rest/v1/ingresos`;
        let metodo = editandoID ? 'PATCH' : 'POST';
        if (editandoID) url += `?id=eq.${editandoID}`;

        const res = await fetch(url, { method: metodo, headers: HEADERS, body: JSON.stringify(datos) });
        if (res.ok) {
            alert(editandoID ? "✅ Registro actualizado" : "✅ Registro guardado");
            location.reload(); 
        }
    };

    // Carga inicial para el visor
    cargarDesdeSupabase();
});
