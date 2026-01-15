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
 * 1. CEREBRO DINÁMICO: Crea las Cajitas Desplegables por Año
 */
function actualizarHistorialDesplegable(datos) {
    const contenedor = document.getElementById('contenedor-historial-desplegable');
    if (!contenedor) return;

    contenedor.innerHTML = ''; 

    const ahora = new Date();
    const mesActualRef = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;

    const historialAgrupado = {};
    datos.forEach(i => {
        const fechaStr = i.fecha || "";
        const mesAnio = fechaStr.slice(0, 7); 
        const anio = fechaStr.slice(0, 4);

        if (mesAnio !== "" && mesAnio < mesActualRef) {
            if (!historialAgrupado[anio]) historialAgrupado[anio] = new Set();
            historialAgrupado[anio].add(mesAnio);
        }
    });

    const aniosDisponibles = Object.keys(historialAgrupado).sort().reverse();

    if (aniosDisponibles.length === 0) {
        contenedor.innerHTML = '<p style="text-align:center; color:gray; padding: 20px;">No hay historial aún.</p>';
        return;
    }

    aniosDisponibles.forEach(anio => {
        const detalles = document.createElement('details');
        detalles.style.marginBottom = "10px";
        detalles.style.border = "1px solid #ddd";
        detalles.style.borderRadius = "8px";
        detalles.style.backgroundColor = "#fff";

        const sumario = document.createElement('summary');
        sumario.innerHTML = `<b>📅 Año ${anio}</b>`;
        sumario.style.padding = "12px";
        sumario.style.cursor = "pointer";

        const divMeses = document.createElement('div');
        divMeses.style.display = "grid";
        divMeses.style.gridTemplateColumns = "repeat(3, 1fr)";
        divMeses.style.gap = "10px";
        divMeses.style.padding = "15px";

        const meses = Array.from(historialAgrupado[anio]).sort().reverse();
        meses.forEach(mesStr => {
            const [_, numMes] = mesStr.split('-');
            const nombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
            
            const btn = document.createElement('button');
            btn.innerText = nombres[parseInt(numMes) - 1];
            btn.style.padding = "10px";
            btn.style.borderRadius = "6px";
            btn.style.border = "1px solid #28a745";
            btn.style.backgroundColor = "white";
            btn.style.color = "#28a745";
            btn.style.fontWeight = "bold";
            btn.style.cursor = "pointer";
            
            btn.onclick = () => {
                irA('lista-section');
                cargarDesdeSupabase(mesStr);
            };
            divMeses.appendChild(btn);
        });

        detalles.appendChild(sumario);
        detalles.appendChild(divMeses);
        contenedor.appendChild(detalles);
    });
}

/**
 * 2. NAVEGACIÓN
 */
function irA(pantallaId) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    document.getElementById(pantallaId).classList.remove('hidden');
}

/**
 * 3. CARGA DE DATOS: Centralizada y Filtrada
 */
async function cargarDesdeSupabase(filtro = 'todos') {
    const tabla = document.getElementById('tabla-ingresos');
    const visorMontoInicio = document.getElementById('monto-total-dinamico');
    const contenedorVisor = document.getElementById('visor-total-rapido');
    
    try {
        const res = await fetch(`${SB_URL}/rest/v1/ingresos?select=*&order=fecha.desc`, { headers: HEADERS });
        const datos = await res.json();
        
        actualizarHistorialDesplegable(datos);

        if (!tabla) return;
        tabla.innerHTML = ''; 
        
        const ahora = new Date();
        const mesActualRef = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
        
        // Calculamos el total del MES ACTUAL para el visor
        const soloMesActual = datos.filter(i => i.fecha && i.fecha.includes(mesActualRef));
        const sumaMesActual = soloMesActual.reduce((acc, curr) => acc + (parseFloat(curr.monto) || 0), 0);

        if (visorMontoInicio) {
            visorMontoInicio.innerText = `$ ${sumaMesActual.toLocaleString('es-AR')}`;
        }

        // Lógica de filtrado para la tabla
        datos.forEach(i => {
            const mesRegistro = i.fecha ? i.fecha.slice(0, 7) : "";
            const esMesActual = (mesRegistro === mesActualRef);
            
            if (filtro === 'actual' && !esMesActual) return;
            if (filtro === 'anteriores' && esMesActual) return;
            if (filtro !== 'todos' && filtro !== 'actual' && filtro !== 'anteriores' && filtro !== mesRegistro) return;

            const montoNum = parseFloat(i.monto) || 0;

            tabla.innerHTML += `
                <tr>
                    <td>
                        <span class="nombre-tabla">${i.nombre_alumno || 'Sin Nombre'}</span>
                        <span class="info-sub-tabla">${i.fecha} • <b>${i.tipo}</b></span>
                    </td>
                    <td class="monto-positivo">$${montoNum.toLocaleString('es-AR')}</td>
                    <td>
                        <div style="display:flex; gap:12px; justify-content:flex-end;">
                            <span onclick="prepararEdicion('${i.id}','${i.nombre_alumno}','${i.monto}','${i.fecha}','${i.tipo}')" style="cursor:pointer; font-size:18px;">✏️</span>
                            <span onclick="borrarRegistro('${i.id}')" style="cursor:pointer; font-size:18px;">🗑️</span>
                        </div>
                    </td>
                </tr>
            `;
        });
        
    } catch (err) { console.error("Error en la carga:", err); }
}

window.prepararEdicion = (id, nombre, monto, fecha, tipo) => {
    editandoID = id;
    document.getElementById('nombre').value = nombre;
    document.getElementById('monto').value = monto;
    document.getElementById('fecha').value = fecha;
    document.getElementById('tipo').value = tipo || 'Diario';
    irA('form-section');
    document.querySelector('.btn-guardar').innerText = "Actualizar Registro";
};

window.borrarRegistro = async (id) => {
    if (!confirm("¿Eliminar este pago definitivamente?")) return;
    await fetch(`${SB_URL}/rest/v1/ingresos?id=eq.${id}`, { method: 'DELETE', headers: HEADERS });
    cargarDesdeSupabase();
};

document.addEventListener('DOMContentLoaded', () => {
    
    document.getElementById('btn-ingresar').onclick = () => {
        editandoID = null;
        document.getElementById('form-alumno').reset();
        document.querySelector('.btn-guardar').innerText = "Guardar Registro";
        irA('form-section');
    };
    
    document.getElementById('btn-ver-lista').onclick = () => {
        // En lista completa, ocultamos el visor de "Total mes actual" para no confundir
        document.getElementById('visor-total-rapido').classList.add('hidden');
        irA('lista-section');
        cargarDesdeSupabase('todos');
    };
    
    document.getElementById('btn-mes-actual-inicio').onclick = () => {
        // Al ver mes actual, aseguramos que el visor sea visible
        document.getElementById('visor-total-rapido').classList.remove('hidden');
        irA('lista-section');
        cargarDesdeSupabase('actual');
    };

    document.getElementById('btn-historial-inicio').onclick = () => {
        irA('historial-section'); 
        cargarDesdeSupabase('anteriores');
    };

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

    // Carga inicial para el visor de la pantalla principal
    cargarDesdeSupabase();
});