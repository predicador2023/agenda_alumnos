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
 * 1. HISTORIAL DINÁMICO (MESES ANTERIORES)
 */
function actualizarHistorialDinamico(datos) {
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

    const anios = Object.keys(historialAgrupado).sort().reverse();
    if (anios.length === 0) {
        contenedor.innerHTML = '<p style="text-align:center; color:gray; padding:10px;">No hay meses previos aún.</p>';
        return;
    }

    anios.forEach(anio => {
        const detalles = document.createElement('details');
        detalles.style.marginBottom = "10px";
        detalles.style.border = "1px solid #ddd";
        detalles.style.borderRadius = "8px";
        detalles.style.backgroundColor = "#fff";

        const sumario = document.createElement('summary');
        sumario.innerHTML = `<b>📅 Año ${anio}</b>`;
        sumario.style.padding = "10px";
        sumario.style.cursor = "pointer";

        const divMeses = document.createElement('div');
        divMeses.style.display = "grid";
        divMeses.style.gridTemplateColumns = "repeat(3, 1fr)";
        divMeses.style.gap = "8px";
        divMeses.style.padding = "10px";

        const meses = Array.from(historialAgrupado[anio]).sort().reverse();
        meses.forEach(mesStr => {
            const [_, numMes] = mesStr.split('-');
            const nombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
            const btn = document.createElement('button');
            btn.innerText = nombres[parseInt(numMes) - 1];
            btn.className = "btn-sub-resumen"; 
            btn.onclick = () => {
                const visor = document.getElementById('visor-total-rapido');
                if (visor) visor.classList.add('hidden'); // Ocultar monto en meses viejos
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

function irA(pantallaId) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    document.getElementById(pantallaId).classList.remove('hidden');
}

/**
 * 3. CARGA DE DATOS (FILTRADO ESTRICTO)
 */
async function cargarDesdeSupabase(filtro = 'nada') {
    const tabla = document.getElementById('tabla-ingresos');
    const visorMontoTexto = document.getElementById('monto-total-dinamico');
    const contenedorVisor = document.getElementById('visor-total-rapido');
    
    try {
        const res = await fetch(`${SB_URL}/rest/v1/ingresos?select=*&order=fecha.desc`, { headers: HEADERS });
        const datos = await res.json();
        
        actualizarHistorialDinamico(datos);

        if (!tabla) return;
        tabla.innerHTML = ''; 
        
        const ahora = new Date();
        const mesActualRef = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
        let sumaFiltrada = 0;

        datos.forEach(i => {
            const mesRegistro = i.fecha ? i.fecha.slice(0, 7) : "";
            
            // LÓGICA DE FILTRADO
            if (filtro === 'actual' && mesRegistro !== mesActualRef) return;
            if (filtro === 'anteriores' && mesRegistro === mesActualRef) return;
            if (filtro !== 'todos' && filtro !== 'actual' && filtro !== 'anteriores' && filtro !== 'nada' && mesRegistro !== filtro) return;

            const montoNum = parseFloat(i.monto) || 0;
            sumaFiltrada += montoNum;

            tabla.innerHTML += `
                <tr>
                    <td>
                        <span class="nombre-tabla">${i.nombre_alumno || 'Sin Nombre'}</span>
                        <span class="info-sub-tabla">${i.fecha} • <b>${i.tipo || 'diario'}</b></span>
                    </td>
                    <td class="monto-positivo">$${montoNum.toLocaleString('es-AR')}</td>
                    <td>
                        <div style="display:flex; gap:12px; justify-content:flex-end;">
                            <span onclick="prepararEdicion('${i.id}','${i.nombre_alumno}','${i.monto}','${i.fecha}','${i.tipo}')" style="cursor:pointer;">✏️</span>
                            <span onclick="borrarRegistro('${i.id}')" style="cursor:pointer;">🗑️</span>
                        </div>
                    </td>
                </tr>
            `;
        });

        // Actualizar monto total del filtro seleccionado
        if (visorMontoTexto) {
            visorMontoTexto.innerText = `$ ${sumaFiltrada.toLocaleString('es-AR')}`;
        }
        
    } catch (err) { console.error("Error:", err); }
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Botón Ingresar
    document.getElementById('btn-ingresar').onclick = () => {
        editandoID = null;
        document.getElementById('form-alumno').reset();
        irA('form-section');
    };
    
    // 2. Botón Ver Lista Completa (Sin Visor)
    document.getElementById('btn-ver-lista').onclick = () => {
        document.getElementById('visor-total-rapido').classList.add('hidden');
        irA('lista-section');
        cargarDesdeSupabase('todos');
    };
    
    // 3. Botón Mes Actual (CON Visor y Animación)
    document.getElementById('btn-mes-actual-inicio').onclick = () => {
        const visor = document.getElementById('visor-total-rapido');
        visor.classList.remove('hidden');
        const cajaVerde = visor.querySelector('.visor-verde-box');
        if (cajaVerde) cajaVerde.classList.add('anim-pulse');
        
        irA('lista-section');
        cargarDesdeSupabase('actual');
    };

    // 4. Botón Meses Anteriores
    document.getElementById('btn-historial-inicio').onclick = () => {
        irA('historial-section');
        cargarDesdeSupabase('anteriores');
    };

    // ... Formulario y Borrar se mantienen igual ...
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
        if (res.ok) { location.reload(); }
    };

    // IMPORTANTE: Al cargar la app, no llamamos a cargarDesdeSupabase para que el visor no aparezca solo.
    // Solo actualizamos el historial dinámico en silencio.
    fetch(`${SB_URL}/rest/v1/ingresos?select=*`, { headers: HEADERS })
        .then(res => res.json())
        .then(datos => actualizarHistorialDinamico(datos));
});

window.prepararEdicion = (id, nombre, monto, fecha, tipo) => {
    editandoID = id;
    document.getElementById('nombre').value = nombre;
    document.getElementById('monto').value = monto;
    document.getElementById('fecha').value = fecha;
    document.getElementById('tipo').value = tipo || 'Diario';
    irA('form-section');
};

window.borrarRegistro = async (id) => {
    if (confirm("¿Eliminar?")) {
        await fetch(`${SB_URL}/rest/v1/ingresos?id=eq.${id}`, { method: 'DELETE', headers: HEADERS });
        location.reload();
    }
};