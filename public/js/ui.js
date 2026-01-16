// js/ui.js

export function irA(sectionId) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(sectionId);
    if (target) target.classList.remove('hidden');
}

export function prepararMontoSinMostrar(total) {
    const visorTexto = document.getElementById('monto-total-dinamico');
    if (visorTexto) {
        // Agregamos tu clase de animación de entrada
        visorTexto.classList.remove('animar-entrada');
        void visorTexto.offsetWidth; // Reset de animación
        visorTexto.innerText = `$ ${total.toLocaleString('es-AR')}`;
        visorTexto.classList.add('animar-entrada');
    }
}

export function mostrarSeccionMonto() {
    irA('lista-section');
    const visor = document.getElementById('visor-total-rapido');
    if (visor) visor.classList.remove('hidden');
}

export function llenarTabla(datos) {
    const tabla = document.getElementById('tabla-ingresos');
    if (!tabla) return;
    tabla.innerHTML = '';

    if (datos.length === 0) {
        tabla.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px; color:gray;">No hay registros este mes.</td></tr>';
        return;
    }

    // Usamos TU estructura: td(1)=65% nombre, td(2)=25% monto, td(3)=10% botones
    datos.forEach(i => {
        const montoNum = parseFloat(i.monto) || 0;
        tabla.innerHTML += `
            <tr>
                <td>
                    <span class="nombre-tabla">${i.nombre || i.nombre_alumno || 'Sin Nombre'}</span>
                    <span class="info-sub-tabla">${i.fecha} • <b>${i.tipo}</b></span>
                </td>
                <td class="monto-valor">$${montoNum.toLocaleString('es-AR')}</td>
                <td>
                    <div style="display:flex; gap:10px; justify-content:flex-end;">
                        <span onclick="window.prepararEdicion('${i.id}')" style="cursor:pointer;">✏️</span>
                        <span onclick="window.borrarRegistro('${i.id}')" style="cursor:pointer;">🗑️</span>
                    </div>
                </td>
            </tr>
        `;
    });
}

/**
 * UI para el historial dinámico.
 * Recibe los datos ya procesados por tu lógica y los muestra.
 */
export function dibujarHistorial(agrupados, callback) {
    const contenedor = document.getElementById('contenedor-historial-desplegable');
    if (!contenedor) return;
    contenedor.innerHTML = "";

    // Obtenemos los años de tu objeto 'agrupados'
    const años = Object.keys(agrupados).sort((a, b) => b - a);

    // Si tu lógica devolvió un objeto vacío (ej: es Enero y no hay meses anteriores)
    if (años.length === 0) {
        contenedor.innerHTML = `
            <div id="mensaje-vacio">
                <p>No hay meses anteriores disponibles para mostrar.</p>
            </div>`;
        return;
    }

    // Si hay datos, los recorremos para crear los botones
    años.forEach(anio => {
        const meses = Array.from(agrupados[anio]).sort().reverse();
        
        meses.forEach(mesAnio => {
            const btn = document.createElement('button');
            btn.className = "btn-blanco-xl"; // Tus clases originales
            btn.style.marginBottom = "10px";
            
            // Mostramos el identificador del mes (ej: 2025-12)
            btn.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <span>📅</span>
                  <strong>${mesAnio}</strong>
                </div>
                <span>Ver registros de este período</span>
            `;
            
            btn.onclick = () => callback(mesAnio);
            contenedor.appendChild(btn);
        });
    });
}