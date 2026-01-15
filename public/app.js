const SB_URL = "https://blmmnlruluciiusilvvm.supabase.co";
const SB_KEY = "sb_publishable_8V-tVlYCibGqYxZa9i_dlQ_t7Ir71aL"; 
const HEADERS = { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}`, "Content-Type": "application/json", "Prefer": "return=representation" };

// Variable para saber si estamos editando
let editandoID = null;

function irA(pantallaId) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    document.getElementById(pantallaId).classList.remove('hidden');
    if (pantallaId === 'lista-section') cargarDesdeSupabase();
}

async function cargarDesdeSupabase(filtro = 'todos') {
    const tabla = document.getElementById('tabla-ingresos');
    const visorMontoInicio = document.getElementById('monto-total-dinamico');
    const resultadoResumenLista = document.getElementById('resultado-resumen');
    
    try {
        const res = await fetch(`${SB_URL}/rest/v1/ingresos?select=*&order=fecha.desc`, { headers: HEADERS });
        const datos = await res.json();
        if (!tabla) return;
        tabla.innerHTML = '';
        let sumaTotal = 0;

        datos.forEach(i => {
            const esEnero = i.fecha && i.fecha.includes('2026-01');
            // Lógica de filtrado para el botón de meses anteriores
            if (filtro === 'enero' && !esEnero) return;
            if (filtro === 'anteriores' && esEnero) return;

            const montoNum = parseFloat(i.monto) || 0;
            if (esEnero) sumaTotal += montoNum;

            tabla.innerHTML += `
                <tr>
                    <td>
                        <strong style="text-transform:uppercase;">${i.nombre_alumno || "Sin Nombre"}</strong><br>
                        <small>${i.fecha}</small>
                    </td>
                    <td style="text-align:center; font-weight:bold; color:#555;">${i.tipo || 'diario'}</td>
                    <td style="color:#1a7f3b; font-weight:bold; text-align:right;">$ ${montoNum.toLocaleString('es-AR')}</td>
                    <td style="text-align:center; min-width:90px;">
                        <button onclick="prepararEdicion('${i.id}', '${i.nombre_alumno}', '${i.monto}', '${i.fecha}', '${i.tipo}')" style="border:none; background:none; font-size:18px; cursor:pointer;">✏️</button>
                        <button onclick="borrarRegistro('${i.id}')" style="border:none; background:none; font-size:18px; cursor:pointer;">🗑️</button>
                    </td>
                </tr>
            `;
        });

        const totalTxt = `$ ${sumaTotal.toLocaleString('es-AR')}`;
        if (visorMontoInicio) visorMontoInicio.innerText = totalTxt;
        if (resultadoResumenLista) resultadoResumenLista.innerText = `Total Enero: ${totalTxt}`;
    } catch (err) { console.error(err); }
}

// --- FUNCIÓN DEL LAPICITO (EDITAR) ---
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
    if (!confirm("¿Eliminar este pago?")) return;
    await fetch(`${SB_URL}/rest/v1/ingresos?id=eq.${id}`, { method: 'DELETE', headers: HEADERS });
    cargarDesdeSupabase();
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-ingresar').onclick = () => {
        editandoID = null; // Reset por si venía de una edición
        document.getElementById('form-alumno').reset();
        document.querySelector('.btn-guardar').innerText = "Guardar Registro";
        irA('form-section');
    };
    
    document.getElementById('btn-ver-lista').onclick = () => cargarDesdeSupabase('todos').then(() => irA('lista-section'));
    
    document.getElementById('btn-mes-actual-inicio').onclick = () => {
        document.getElementById('visor-total-rapido').classList.remove('hidden');
        cargarDesdeSupabase('enero');
    };

    // --- SOLUCIÓN MESES ANTERIORES ---
    document.getElementById('btn-historial-inicio').onclick = () => {
        irA('lista-section');
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
        let metodo = 'POST';

        if (editandoID) {
            url += `?id=eq.${editandoID}`;
            metodo = 'PATCH'; // Usamos PATCH para actualizar
        }

        const res = await fetch(url, {
            method: metodo,
            headers: HEADERS,
            body: JSON.stringify(datos)
        });

        if (res.ok) {
            alert(editandoID ? "✅ Registro actualizado" : "✅ Registro guardado");
            editandoID = null;
            location.reload();
        }
    };
});