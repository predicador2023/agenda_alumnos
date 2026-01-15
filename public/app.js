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

// --- 3. TRAER DATOS (CON NOMBRES Y TIPO CORREGIDOS) ---
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
            const montoNum = parseFloat(i.monto) || 0;
            // Intentamos sacar el nombre aunque la columna se llame distinto
            const nombreAlumno = i.nombre || i.alumno || "Sin nombre";
            const tipoPago = i.tipo || i.tipo_pago || "S/D";

            if (i.fecha && i.fecha.includes('2026-01')) {
                sumaEnero += montoNum;
            }

            tabla.innerHTML += `
                <tr>
                    <td>
                        <strong style="text-transform:uppercase;">${nombreAlumno}</strong><br>
                        <small>${i.fecha} • <span style="color:#666">${tipoPago}</span></small>
                    </td>
                    <td style="color:green; font-weight:bold; text-align:right;">
                        $ ${montoNum.toLocaleString('es-AR')}
                    </td>
                    <td style="text-align:center; min-width:80px;">
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
        console.error("Error en Supabase:", err);
    }
}

// --- 4. FUNCIONES DE ACCIÓN ---
window.borrarRegistro = async (id) => {
    if (!confirm("¿Eliminar este registro?")) return;
    await fetch(`${SB_URL}/rest/v1/ingresos?id=eq.${id}`, { method: 'DELETE', headers: HEADERS });
    cargarDesdeSupabase();
};

window.editarRegistro = (id) => {
    alert("Función para editar el registro ID: " + id + "\nPróximamente disponible.");
    // Aquí podríamos abrir el formulario con los datos cargados
};

// --- 5. INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-ingresar').onclick = () => irA('form-section');
    document.getElementById('btn-ver-lista').onclick = () => irA('lista-section');
    
    document.getElementById('btn-mes-actual-inicio').onclick = () => {
        document.getElementById('visor-total-rapido').classList.remove('hidden');
        cargarDesdeSupabase();
    };

    const form = document.getElementById('form-alumno');
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const nuevo = {
                nombre: document.getElementById('nombre').value,
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
                alert("✅ Guardado correctamente");
                form.reset();
                location.reload();
            }
        };
    }
    cargarDesdeSupabase();
});