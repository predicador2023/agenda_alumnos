document.addEventListener('DOMContentLoaded', () => {
    // --- 1. REFERENCIAS AL HTML ---
    const menuPrincipal = document.getElementById('menu-principal');
    const formSection = document.getElementById('form-section');
    const listaSection = document.getElementById('lista-section');
    const tablaIngresos = document.getElementById('tabla-ingresos');
    const montoTotalDinamico = document.getElementById('monto-total-dinamico');
    const visorTotalRapido = document.getElementById('visor-total-rapido');
    const filtroMesDinamico = document.getElementById('filtro-mes-dinamico');

    // --- 2. FUNCIÓN DE NAVEGACIÓN ---
    function irA(pantalla) {
        if (!pantalla) return;
        menuPrincipal.classList.add('hidden');
        formSection.classList.add('hidden');
        listaSection.classList.add('hidden');
        pantalla.classList.remove('hidden');
    }

    // --- 3. RENDERIZAR TABLA Y SUMAR MONTOS ---
    function cargarDatos(filtro = 'todos') {
        const ingresos = JSON.parse(localStorage.getItem('ingresos')) || [];
        if (!tablaIngresos) return;
        
        tablaIngresos.innerHTML = '';
        let sumaTotal = 0;

        // FILTRO FLEXIBLE: Busca Enero o 2026 en cualquier formato (lunes, ayer y hoy)
        const datosFiltrados = (filtro === 'actual') 
            ? ingresos.filter(i => {
                if (!i.fecha) return false;
                return i.fecha.includes('2026-01') || i.fecha.includes('/01/') || i.fecha.includes('-01-');
              }) 
            : ingresos;

        if (datosFiltrados.length === 0) {
            tablaIngresos.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px;">No hay registros este mes</td></tr>';
        } else {
            datosFiltrados.forEach(i => {
                const montoNum = parseFloat(i.monto) || 0;
                sumaTotal += montoNum;
                
                tablaIngresos.innerHTML += `
                    <tr>
                        <td><strong>${i.nombre}</strong><br><small>${i.fecha} - ${i.tipo}</small></td>
                        <td style="color:green; font-weight:800; text-align:right;">
                            $ ${montoNum.toLocaleString('es-AR')}
                        </td>
                        <td style="text-align:center;">
                            <button onclick="borrarRegistro('${i.id}')" style="border:none; background:none; font-size:18px; cursor:pointer;">🗑️</button>
                        </td>
                    </tr>
                `;
            });
        }

        // Actualizar los visores de MONTOS
        const totalFormateado = `$ ${sumaTotal.toLocaleString('es-AR')}`;
        if (montoTotalDinamico) montoTotalDinamico.innerText = totalFormateado;
        
        const resResumen = document.getElementById('resultado-resumen');
        if (resResumen) resResumen.innerText = `Total: ${totalFormateado}`;
    }

    // --- 4. EVENTOS DE BOTONES ---

    // Botón "Ingresar Alumno"
    const btnIngresar = document.getElementById('btn-ingresar');
    if (btnIngresar) {
        btnIngresar.onclick = () => {
            irA(formSection);
            // Setea fecha de hoy 14/01/2026 por defecto
            document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
        };
    }

    // Botón "Ver Lista Completa"
    const btnVerLista = document.getElementById('btn-ver-lista');
    if (btnVerLista) {
        btnVerLista.onclick = () => {
            irA(listaSection);
            if(filtroMesDinamico) filtroMesDinamico.value = "todos";
            cargarDatos('todos');
        };
    }

    // Botón "Ver Mes Actual" (Inicio)
    const btnMesActual = document.getElementById('btn-mes-actual-inicio');
    if (btnMesActual) {
        btnMesActual.onclick = () => {
            if (visorTotalRapido) visorTotalRapido.classList.remove('hidden');
            cargarDatos('actual');
        };
    }

    // Botón "Meses Anteriores"
    const btnHistorial = document.getElementById('btn-historial-inicio');
    if (btnHistorial) {
        btnHistorial.onclick = () => {
            irA(listaSection);
            // Mostramos todo el historial disponible
            cargarDatos('todos');
        };
    }

    // Selector de meses dentro de la lista
    if (filtroMesDinamico) {
        filtroMesDinamico.onchange = (e) => {
            cargarDatos(e.target.value);
        };
    }

    // --- 5. GUARDAR REGISTRO ---
    const form = document.getElementById('form-alumno');
    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const ingresos = JSON.parse(localStorage.getItem('ingresos')) || [];
            
            const nuevoRegistro = {
                id: Date.now().toString(),
                nombre: document.getElementById('nombre').value,
                monto: document.getElementById('monto').value,
                fecha: document.getElementById('fecha').value,
                tipo: document.getElementById('tipo').value
            };

            ingresos.push(nuevoRegistro);
            localStorage.setItem('ingresos', JSON.stringify(ingresos));
            alert("✅ Registro guardado: " + nuevoRegistro.nombre);
            location.reload(); // Recarga para volver al inicio prolijo
        };
    }
});

// --- 6. FUNCIÓN BORRAR (Global para que el HTML la vea) ---
window.borrarRegistro = (id) => {
    if (confirm("¿Estás seguro de eliminar este registro?")) {
        let ingresos = JSON.parse(localStorage.getItem('ingresos')) || [];
        ingresos = ingresos.filter(i => i.id !== id);
        localStorage.setItem('ingresos', JSON.stringify(ingresos));
        location.reload();
    }
};