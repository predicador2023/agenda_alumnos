// --- 1. CONFIGURACIÓN SUPABASE ---
const SB_URL = "https://blmmnlruluciiusilvvm.supabase.co";
const SB_KEY = "sb_publishable_8V-tVlYCibGqYxZa9i_dlQ_t7Ir71aL"; 
const HEADERS = {
    "apikey": SB_KEY,
    "Authorization": `Bearer ${SB_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
};

// --- 2. NAVEGACIÓN ---
function irA(pantallaId) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    document.getElementById(pantallaId).classList.remove('hidden');
    if (pantallaId === 'lista-section') cargarDesdeSupabase();
}

// --- 3. CARGAR DATOS (Mapeado a tu tabla real) ---
async function cargarDesdeSupabase() {
    const tabla = document.getElementById('tabla-ingresos');
    const visorMontoInicio = document.getElementById('monto-total-dinamico');
    const resultadoResumenLista = document.getElementById('resultado-resumen');
    
    try {
        const res = await fetch(`${SB_URL}/rest/v1/ingresos?select=*&order=fecha.desc`, { headers: HEADERS });
        const datos = await res.json();
        
        if (!tabla) return;
        tabla.innerHTML = '';
        let sumaEnero = 0;

        datos.forEach(i => {
            // USAMOS LOS NOMBRES EXACTOS DE TU CAPTURA DE SUPABASE
            const nombreMostrar = i.nombre_alumno || "Sin Nombre"; 
            const montoNum = parseFloat(i.monto) || 0;
            const tipoPago = i.tipo || "diario"; 

            // Suma para el visor (Enero 2026)
            if (i.fecha && i.fecha.includes('2026-01')) {
                sumaEnero += montoNum;
            }

            tabla.innerHTML += `
                <tr>
                    <td>
                        <strong style="text-transform:uppercase; color:#333;">${nombreMostrar}</strong><br>
                        <small style="color:#666;">${i.fecha} • <b>${tipoPago}</b></small>
                    </td>
                    <td style="color:#1a7f3b; font-weight:bold; text-align:right; font-size:15px;">
                        $ ${montoNum.toLocaleString('es-AR')}
                    </td>
                    <td style="text-align:center; min-width:85px;">
                        <button onclick="editarRegistro('${i.id}')" style="border:none; background:none; font-size:18px; cursor:pointer;">✏️</button>
                        <button onclick="borrarRegistro('${i.id}')" style="border:none; background:none; font-size:18px; cursor:pointer;">🗑️</button>
                    </td>
                </tr>
            `;
        });

        const totalFormateado = `$ ${sumaEnero.toLocaleString('es-AR')}`;
        if (visorMontoInicio) visorMontoInicio.innerText = totalFormateado;
        if (resultadoResumenLista) resultadoResumenLista.innerText = `Total: ${totalFormateado}`;

    } catch (err) {
        console.error("Error al cargar datos:", err);
    }
}

// --- 4. ACCIONES (Borrar y Editar) ---
window.borrarRegistro = async (id) => {
    if (!confirm("¿Eliminar este pago?")) return;
    await fetch(`${SB_URL}/rest/v1/ingresos?id=eq.${id}`, { method: 'DELETE', headers: HEADERS });
    cargarDesdeSupabase();
};

window.editarRegistro = (id) => {
    alert("Para editar el pago de Facundo o Máximo (ID: " + id + "), por ahora borralo y cargalo de nuevo. ¡Pronto estará listo el editor!");
};

// --- 5. INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    // Botones principales
    document.getElementById('btn-ingresar').onclick = () => irA('form-section');
    document.getElementById('btn-ver-lista').onclick = () => irA('lista-section');
    
    document.getElementById('btn-mes-actual-inicio').onclick = () => {
        document.getElementById('visor-total-rapido').classList.remove('hidden');
        cargarDesdeSupabase();
    };

    // Formulario de envío (Ajustado a tu tabla)
    const form = document.getElementById('form-alumno');
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const nuevo = {
                nombre_alumno: document.getElementById('nombre').value, // Ajustado a tu tabla
                monto: document.getElementById('monto').value,
                fecha: document.getElementById('fecha').value,
                tipo: document.getElementById('tipo').value
            };

            const res = await fetch(`${SB_URL}/rest/v1/ingresos`, {
                method: 'POST',
                headers: HEADERS,
                body: JSON.stringify(nuevo)
            });
            
            if (res.ok) {
                alert("✅ Pago de " + nuevo.nombre_alumno + " guardado!");
                form.reset();
                location.reload();
            }
        };
    }
    // Carga inicial
    cargarDesdeSupabase();
});