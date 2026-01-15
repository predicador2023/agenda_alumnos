// --- 1. CONFIGURACIÓN SUPABASE ---
const SB_URL = "https://blmmnlruluciiusilvvm.supabase.co";
const SB_KEY = "sb_publishable_8V-tVlYCibGqYxZa9i_dlQ_t7Ir71aL"; 
const HEADERS = {
    "apikey": SB_KEY,
    "Authorization": `Bearer ${SB_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
};

// --- 2. FUNCIÓN DE NAVEGACIÓN ---
function irA(pantallaId) {
    // Ocultar todas las secciones
    document.getElementById('menu-principal').classList.add('hidden');
    document.getElementById('form-section').classList.add('hidden');
    document.getElementById('lista-section').classList.add('hidden');
    
    // Mostrar la elegida
    const destino = document.getElementById(pantallaId);
    if (destino) destino.classList.remove('hidden');

    // Si vamos a la lista, cargamos los datos
    if (pantallaId === 'lista-section') cargarDesdeSupabase();
}

// --- 3. TRAER DATOS Y ACTUALIZAR MONTOS ---
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
            // Sumar si es Enero 2026
            if (i.fecha && i.fecha.includes('2026-01')) {
                sumaEnero += montoNum;
            }

            tabla.innerHTML += `
                <tr>
                    <td><strong>${i.nombre}</strong><br><small>${i.fecha} - ${i.tipo}</small></td>
                    <td style="color:green; font-weight:bold; text-align:right;">
                        $ ${montoNum.toLocaleString('es-AR')}
                    </td>
                    <td style="text-align:center;">
                        <button onclick="borrarRegistro('${i.id}')" style="border:none; background:none; font-size:18px; cursor:pointer;">🗑️</button>
                    </td>
                </tr>
            `;
        });

        // Actualizar montos en la interfaz
        const totalFormateado = `$ ${sumaEnero.toLocaleString('es-AR')}`;
        if (visorMontoInicio) visorMontoInicio.innerText = totalFormateado;
        if (resultadoResumenLista) resultadoResumenLista.innerText = `Total: ${totalFormateado}`;

    } catch (err) {
        console.error("Error al conectar con Supabase:", err);
    }
}

// --- 4. BORRAR REGISTRO ---
window.borrarRegistro = async (id) => {
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
};

// --- 5. INICIALIZACIÓN AL CARGAR LA PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {
    
    // Conectar botones del Menú Principal
    document.getElementById('btn-ingresar').onclick = () => irA('form-section');
    document.getElementById('btn-ver-lista').onclick = () => irA('lista-section');
    
    // Botón "Ver mes actual" (Muestra el visor verde)
    document.getElementById('btn-mes-actual-inicio').onclick = () => {
        document.getElementById('visor-total-rapido').classList.remove('hidden');
        cargarDesdeSupabase();
    };

    // Botón "Meses anteriores" (Por ahora solo refresca o avisa)
    document.getElementById('btn-historial-inicio').onclick = () => {
        alert("Historial completo disponible en 'Ver lista completa'");
    };

    // Configurar Formulario de Ingreso
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
                    alert("✅ Registro guardado en Supabase");
                    form.reset();
                    location.reload(); // Recargamos para ver cambios
                }
            } catch (err) {
                alert("Error al guardar en la nube");
            }
        };
    }

    // Carga inicial de datos silenciosa
    cargarDesdeSupabase();
});