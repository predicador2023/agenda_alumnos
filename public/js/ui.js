// js/ui.js

/**
 * Cambia la visibilidad de las secciones.
 */
export function irA(pantallaId) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    const pantalla = document.getElementById(pantallaId);
    if(pantalla) pantalla.classList.remove('hidden');
}

/**
 * Limpia la tabla y prepara el visor para el monto actual.
 */
export function prepararEscenarioMonto(total) {
    const tabla = document.getElementById('tabla-ingresos');
    const visorTexto = document.getElementById('monto-total-dinamico');
    const visorContenedor = document.getElementById('visor-total-rapido');
    const listaSection = document.getElementById('lista-section');
    
    if (tabla) tabla.innerHTML = ''; // Limpiamos la lista
    if (visorTexto) visorTexto.innerText = `$ ${total.toLocaleString('es-AR')}`;
    
    if (visorContenedor && listaSection) {
        listaSection.prepend(visorContenedor); 
        visorContenedor.classList.remove('hidden');
        const cajaVerde = visorContenedor.querySelector('.visor-verde-box');
        if (cajaVerde) {
            cajaVerde.classList.remove('anim-pulse');
            void cajaVerde.offsetWidth; // Reset animación
            cajaVerde.classList.add('anim-pulse');
        }
    }
}

/**
 * Renderiza una fila en la tabla de alumnos.
 */
export function renderizarFila(i, tabla) {
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
                    <span onclick="window.prepararEdicion('${i.id}','${i.nombre_alumno}','${i.monto}','${i.fecha}','${i.tipo}')" style="cursor:pointer; font-size:18px;">✏️</span>
                    <span onclick="window.borrarRegistro('${i.id}')" style="cursor:pointer; font-size:18px;">🗑️</span>
                </div>
            </td>
        </tr>
    `;
}

/**
 * Dibuja el historial dinámico de meses anteriores.
 */
export function dibujarHistorial(agrupado, alSeleccionarMes) {
    const contenedor = document.getElementById('contenedor-historial-desplegable');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    Object.keys(agrupado).sort().reverse().forEach(anio => {
        const detalles = document.createElement('details');
        detalles.className = "estilo-historial-anio"; // Podés agregar clases CSS después
        
        const sumario = document.createElement('summary');
        sumario.innerHTML = `<b>📅 Año ${anio}</b>`;
        
        const divMeses = document.createElement('div');
        divMeses.className = "grid-meses";

        Array.from(agrupado[anio]).sort().reverse().forEach(mesStr => {
            const numMes = mesStr.split('-')[1];
            const nombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
            const btn = document.createElement('button');
            btn.innerText = nombres[parseInt(numMes) - 1];
            btn.className = "btn-sub-resumen";
            btn.onclick = () => alSeleccionarMes(mesStr);
            divMeses.appendChild(btn);
        });

        detalles.appendChild(sumario);
        detalles.appendChild(divMeses);
        contenedor.appendChild(detalles);
    });
}