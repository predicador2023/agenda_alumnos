document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CONFIGURACIÓN SUPABASE ---
    const SB_URL = "https://blmmnlruluciiusilvvm.supabase.co";
    const SB_KEY = "sb_publishable_8V-tVlYCibGqYxZa9i_dlQ_t7Ir71aL"; // Tu clave anon
    const HEADERS = {
        "apikey": SB_KEY,
        "Authorization": `Bearer ${SB_KEY}`,
        "Content-Type": "application/json"
    };

    // --- 2. REFERENCIAS AL HTML ---
    const tablaIngresos = document.getElementById('tabla-ingresos');
    const montoTotalDinamico = document.getElementById('monto-total-dinamico');
    const formAlumno = document.getElementById('form-alumno');

    // --- 3. FUNCIÓN PARA TRAER DATOS (GET) ---
    async function obtenerDatos() {
        try {
            const respuesta = await fetch(`${SB_URL}/rest/v1/ingresos?select=*`, { headers: HEADERS });
            const datos = await respuesta.json();
            renderizarTabla(datos);
        } catch (error) {
            console.error("Error trayendo datos:", error);
        }
    }

    // --- 4. RENDERIZAR Y SUMAR MONTOS ---
    function renderizarTabla(ingresos) {
        if (!tablaIngresos) return;
        tablaIngresos.innerHTML = '';
        let sumaTotal = 0;

        // Filtrar solo Enero 2026 para el visor
        const mesActual = "2026-01"; 
        
        ingresos.forEach(i => {
            const montoNum = parseFloat(i.monto) || 0;
            
            // Sumamos al total si es de enero (independiente del formato)
            if (i.fecha && i.fecha.includes(mesActual)) {
                sumaTotal += montoNum;
            }

            tablaIngresos.innerHTML += `
                <tr>
                    <td><strong>${i.nombre}</strong><br><small>${i.fecha}</small></td>
                    <td style="color:green; font-weight:bold; text-align:right;">
                        $ ${montoNum.toLocaleString('es-AR')}
                    </td>
                    <td style="text-align:center;">
                        <button onclick="borrarDeSupabase('${i.id}')" style="border:none; background:none; cursor:pointer;">🗑️</button>
                    </td>
                </tr>
            `;
        });

        const totalTxt = `$ ${sumaTotal.toLocaleString('es-AR')}`;
        if (montoTotalDinamico) montoTotalDinamico.innerText = totalTxt;
    }

    // --- 5. GUARDAR EN SUPABASE (POST) ---
    if (formAlumno) {
        formAlumno.onsubmit = async (e) => {
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
                    alert("✅ Guardado en la nube");
                    location.reload();
                }
            } catch (err) {
                alert("Error al guardar");
            }
        };
    }

    // --- 6. BORRAR DE SUPABASE (DELETE) ---
    window.borrarDeSupabase = async (id) => {
        if (!confirm("¿Borrar este registro?")) return;
        try {
            await fetch(`${SB_URL}/rest/v1/ingresos?id=eq.${id}`, {
                method: 'DELETE',
                headers: HEADERS
            });
            location.reload();
        } catch (err) {
            console.error("Error al borrar");
        }
    };

    // Ejecutar al cargar la página
    obtenerDatos();
});