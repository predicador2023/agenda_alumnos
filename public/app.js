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

function irA(pantallaId) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    const pantalla = document.getElementById(pantallaId);
    if(pantalla) pantalla.classList.remove('hidden');
}

/**
 * CARGA DE DATOS: Control absoluto de lo que se muestra
 */
async function cargarDatos(modo = 'todos') {
    const tabla = document.getElementById('tabla-ingresos');
    const visorMontoTexto = document.getElementById('monto-total-dinamico');
    const visorContenedor = document.getElementById('visor-total-rapido');
    const listaSection = document.getElementById('lista-section');
    
    try {
        const res = await fetch(`${SB_URL}/rest/v1/ingresos?select=*&order=fecha.desc`, { headers: HEADERS });
        const datos = await res.json();
        
        actualizarHistorialDinamico(datos);

        const ahora = new Date();
        const mesActualRef = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
        
        // CÁLCULO DEL MES ACTUAL
        const soloMesActual = datos.filter(i => i.fecha && i.fecha.includes(mesActualRef));
        const sumaMesActual = soloMesActual.reduce((acc, curr) => acc + (parseFloat(curr.monto) || 0), 0);
        
        if (visorMontoTexto) {
            visorMontoTexto.innerText = `$ ${sumaMesActual.toLocaleString('es-AR')}`;
        }

        // --- LÓGICA DE VISUALIZACIÓN ---
        
        if (modo === 'monto-solo') {
            if (visorContenedor && listaSection) {
                // TELETRANSPORTE: Movemos el visor adentro de la sección de lista
                listaSection.prepend(visorContenedor); 
                visorContenedor.classList.remove('hidden');
                
                // Aseguramos que la animación de pulso se active
                const cajaVerde = visorContenedor.querySelector('.visor-verde-box');
                if (cajaVerde) cajaVerde.classList.add('anim-pulse');
            }
            if (tabla) tabla.innerHTML = ''; // Vaciamos la lista para que no se vea nada abajo
        } 
        
        else if (modo === 'lista-completa') {
            if (visorContenedor) visorContenedor.classList.add('hidden');
            if (tabla) {
                tabla.innerHTML = '';
                datos.forEach(i => renderizarFila(i, tabla));
            }
        }
        
        else if (modo === 'historial-mes') {
            if (visorContenedor) visorContenedor.classList.add('hidden');
            if (tabla) {
                tabla.innerHTML = '';
                const filtrados = datos.filter(i => i.fecha && i.fecha.includes(window.mesSeleccionado));
                filtrados.forEach(i => renderizarFila(i, tabla));
            }
        }
        
    } catch (err) { console.error("Error cargando datos:", err); }
}

function renderizarFila(i, tabla) {
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
}

function actualizarHistorialDinamico(datos) {
    const contenedor = document.getElementById('contenedor-historial-desplegable');
    if (!contenedor) return;
    contenedor.innerHTML = '';
    const ahora = new Date();
    const mesActualRef = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
    const historialAgrupado = {};
    
    datos.forEach(i => {
        const mesAnio = i.fecha ? i.fecha.slice(0, 7) : "";
        const anio = i.fecha ? i.fecha.slice(0, 4) : "";
        if (mesAnio !== "" && mesAnio < mesActualRef) {
            if (!historialAgrupado[anio]) historialAgrupado[anio] = new Set();
            historialAgrupado[anio].add(mesAnio);
        }
    });

    Object.keys(historialAgrupado).sort().reverse().forEach(anio => {
        const detalles = document.createElement('details');
        detalles.style.marginBottom = "10px";
        detalles.style.border = "1px solid #ddd";
        detalles.style.borderRadius = "8px";
        detalles.style.backgroundColor = "white";
        const sumario = document.createElement('summary');
        sumario.innerHTML = `<b>📅 Año ${anio}</b>`;
        sumario.style.padding = "10px";
        const divMeses = document.createElement('div');
        divMeses.style.display = "grid";
        divMeses.style.gridTemplateColumns = "repeat(3, 1fr)";
        divMeses.style.gap = "8px";
        divMeses.style.padding = "10px";
        
        Array.from(historialAgrupado[anio]).sort().reverse().forEach(mesStr => {
            const numMes = mesStr.split('-')[1];
            const nombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
            const btn = document.createElement('button');
            btn.innerText = nombres[parseInt(numMes) - 1];
            btn.className = "btn-sub-resumen";
            btn.onclick = () => { 
                window.mesSeleccionado = mesStr;
                irA('lista-section'); 
                cargarDatos('historial-mes'); 
            };
            divMeses.appendChild(btn);
        });
        detalles.appendChild(sumario);
        detalles.appendChild(divMeses);
        contenedor.appendChild(detalles);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // BOTÓN: VER MES ACTUAL (TELETRANSPORTE Y CARGA)
    document.getElementById('btn-mes-actual-inicio').onclick = () => {
        irA('lista-section'); 
        cargarDatos('monto-solo'); 
    };

    document.getElementById('btn-ver-lista').onclick = () => {
        irA('lista-section');
        cargarDatos('lista-completa');
    };

    document.getElementById('btn-historial-inicio').onclick = () => {
        irA('historial-section');
        cargarDatos('nada'); 
    };

    document.getElementById('btn-ingresar').onclick = () => {
        editandoID = null;
        document.getElementById('form-alumno').reset();
        irA('form-section');
    };

    document.getElementById('form-alumno').onsubmit = async (e) => {
        e.preventDefault();
        const datos = {
            nombre_alumno: document.getElementById('nombre').value,
            monto: document.getElementById('monto').value,
            fecha: document.getElementById('fecha').value,
            tipo: document.getElementById('tipo').value
        };
        await fetch(`${SB_URL}/rest/v1/ingresos${editandoID ? `?id=eq.${editandoID}` : ''}`, { 
            method: editandoID ? 'PATCH' : 'POST', 
            headers: HEADERS, 
            body: JSON.stringify(datos) 
        });
        location.reload();
    };

    cargarDatos('nada'); 
});

window.prepararEdicion = (id, nombre, monto, fecha, tipo) => {
    editandoID = id;
    document.getElementById('nombre').value = nombre;
    document.getElementById('monto').value = monto;
    document.getElementById('fecha').value = fecha;
    document.getElementById('tipo').value = tipo;
    irA('form-section');
};

window.borrarRegistro = async (id) => {
    if (confirm("¿Eliminar?")) {
        await fetch(`${SB_URL}/rest/v1/ingresos?id=eq.${id}`, { method: 'DELETE', headers: HEADERS });
        location.reload();
    }
};