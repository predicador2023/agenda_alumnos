// --- 1. CONFIGURACIÓN SUPABASE (Global) ---
const SB_URL = "https://blmmnlruluciiusilvvm.supabase.co";
const SB_KEY = "sb_publishable_8V-tVlYCibGqYxZa9i_dlQ_t7Ir71aL"; 
const HEADERS = {
    "apikey": SB_KEY,
    "Authorization": `Bearer ${SB_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
};

// --- 2. FUNCIONES DE NAVEGACIÓN (Globales para que los botones funcionen) ---
function irA(pantallaId) {
    // Ocultamos todas las secciones
    document.getElementById('menu-principal').classList.add('hidden');
    document.getElementById('form-section').classList.add('hidden');
    document.getElementById('lista-section').classList.add('hidden');
    
    // Mostramos la que queremos
    const destino = document.getElementById(pantallaId);
    if(destino) {
        destino.classList.remove('hidden');
    }

    // Si vamos a la lista, cargamos los datos de Supabase
    if(pantallaId === 'lista-section') {
        cargarDesdeSupabase();
    }
}

// --- 3. TRAER DATOS Y SUMAR MONTOS ---
async function cargarDesdeSupabase() {
    const tabla = document.getElementById('tabla-ingresos');
    const visorMonto = document.getElementById('monto-total-dinamico');
    
    try {
        const res = await fetch(`${SB_URL}/rest/v1/ingresos?select=*&order=fecha.desc`, { headers: HEADERS });
        const datos = await res.json();
        
        if (!tabla) return;
        tabla.innerHTML = '';
        let sumaEnero = 0;

        datos.forEach(i => {
            const montoNum = parseFloat(i.monto) || 0;
            // Verificamos si es de Enero 2026 para el visor
            if (i.fecha && i.fecha.includes('2026-01')) {
                sumaEnero += montoNum;
            }

            tabla.innerHTML += `
                <tr>
                    <td><strong>${i.nombre}</strong><br><small>${i.fecha}</small></td>
                    <td style="color:green; font-weight:bold; text-align:right;">
                        $ ${montoNum.toLocaleString('es-AR')}
                    </td>
                    <td style="text-align:center;">
                        <button onclick="borrarDeSupabase('${i.id}')" style="border:none; background:none; font-size:18px;">🗑️</button>
                    </td>
                </tr>
            `;
        });

        if (visorMonto) {
            visorMonto.innerText = `$ ${sumaEnero.toLocaleString('es-AR')}`;
        }
    } catch (err) {
        console.error("Error al cargar:", err);
    }
}

// --- 4. BORRAR REGISTRO ---
async function borrarDeSupabase(id) {
    if (!confirm("¿Eliminar este registro de la nube?")) return;
    try {
        await fetch(`${SB_URL}/rest/v1/ingresos?id=eq.${id}`, {
            method: 'DELETE',
            headers: HEADERS
        });
        cargarDesdeSupabase();
    } catch (err) {
        alert("No se pudo borrar");
    }
}

// --- 5. INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    // Carga inicial para el visor verde del home
    cargarDesdeSupabase();

    // Configurar el formulario
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

            try {
                const res = await fetch(`${SB_URL}/rest/v1/ingresos`, {
                    method: 'POST',
                    headers: HEADERS,
                    body: JSON.stringify(nuevo)
                });
                if (res.ok) {
                    alert("✅ Guardado en Supabase");
                    form.reset();
                    irA('menu-principal');
                    cargarDesdeSupabase();
                }
            } catch (err) {
                alert("Error al guardar");
            }
        };
    }
});