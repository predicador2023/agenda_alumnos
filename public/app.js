document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. SELECTORES Y VARIABLES GLOBALES
    // ==========================================
    const menuPrincipal = document.getElementById('menu-principal');
    const formSection = document.getElementById('form-section');
    const listaSection = document.getElementById('lista-section');
    const formAlumno = document.getElementById('form-alumno');
    const tablaIngresos = document.getElementById('tabla-ingresos');
    const filtroMesDinamico = document.getElementById('filtro-mes-dinamico');
    const grupoMesesHistorial = document.getElementById('grupo-meses-historial');
    const mensajeVacio = document.getElementById('mensaje-vacio');
    
    // Selectores para la nueva lógica de Resumen en Inicio
    const visorTotalRapido = document.getElementById('visor-total-rapido');
    const montoTotalDinamico = document.getElementById('monto-total-dinamico');
    const resultadoResumen = document.getElementById('resultado-resumen');

    // Inputs del formulario
    const inputId = document.getElementById('edit-id');
    const inputNombre = document.getElementById('nombre');
    const inputTipo = document.getElementById('tipo');
    const inputMonto = document.getElementById('monto');
    const inputFecha = document.getElementById('fecha');
    const formTitulo = document.getElementById('form-titulo');

    let ingresos = [];

    // ==========================================
    // 2. FUNCIONES DE NAVEGACIÓN
    // ==========================================
    function mostrarSeccion(seccion) {
        menuPrincipal.classList.add('hidden');
        formSection.classList.add('hidden');
        listaSection.classList.add('hidden');
        seccion.classList.remove('hidden');
    }

    window.cancelarEdicion = function() {
        formAlumno.reset();
        inputId.value = "";
        formTitulo.textContent = "Nuevo ingreso";
        mostrarSeccion(menuPrincipal);
    };

    // ==========================================
    // 3. GESTIÓN DE DATOS (CRUD ORIGINAL)
    // ==========================================
    async function cargarIngresos() {
        try {
            const response = await fetch('/api/ingresos'); 
            if (!response.ok) throw new Error("Error al obtener datos");
            ingresos = await response.json();
            
            // Guardamos backup local por seguridad
            localStorage.setItem('ingresos_backup', JSON.stringify(ingresos));
            
            actualizarSelectorMeses();
            renderizarTabla();
        } catch (error) {
            console.error("Error cargando ingresos:", error);
            const local = localStorage.getItem('ingresos_backup');
            if (local) ingresos = JSON.parse(local);
            renderizarTabla();
        }
    }

    async function guardarIngreso(e) {
        e.preventDefault();
        const datos = {
            nombre_alumno: inputNombre.value.trim(),
            tipo: inputTipo.value,
            monto: parseFloat(inputMonto.value),
            fecha: inputFecha.value || new Date().toISOString().split('T')[0]
        };

        const id = inputId.value;
        const url = id ? `/api/ingresos/${id}` : '/api/ingresos';
        const method = id ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            if (res.ok) {
                mostrarConfirmacion(id ? "Actualizado correctamente" : "Guardado con éxito");
                formAlumno.reset();
                inputId.value = "";
                await cargarIngresos();
                mostrarSeccion(menuPrincipal);
            }
        } catch (error) {
            console.error("Error al guardar:", error);
        }
    }

    // ==========================================
    // 4. LÓGICA DE FILTROS Y TABLA
    // ==========================================
    function actualizarSelectorMeses() {
        if (!grupoMesesHistorial) return;
        grupoMesesHistorial.innerHTML = "";
        const periodos = [...new Set(ingresos.map(i => i.fecha ? i.fecha.substring(0, 7) : null))]
                        .filter(Boolean)
                        .sort()
                        .reverse();

        periodos.forEach(periodo => {
            const [year, month] = periodo.split('-');
            const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                                  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
            const option = document.createElement('option');
            option.value = periodo;
            option.textContent = `${nombresMeses[parseInt(month)-1]} ${year}`;
            grupoMesesHistorial.appendChild(option);
        });
    }

    function renderizarTabla() {
        if (!tablaIngresos) return;
        tablaIngresos.innerHTML = "";
        const filtro = filtroMesDinamico.value;
        const mesActual = new Date().toISOString().substring(0, 7);
        let totalAcumulado = 0;

        let filtrados = ingresos;

        if (filtro === "actual") {
            filtrados = ingresos.filter(i => i.fecha && i.fecha.startsWith(mesActual));
        } else if (filtro !== "todos") {
            filtrados = ingresos.filter(i => i.fecha && i.fecha.startsWith(filtro));
        }

        if (filtrados.length === 0) {
            mensajeVacio.classList.remove('hidden');
            if(resultadoResumen) resultadoResumen.textContent = "Total del período: $0";
        } else {
            mensajeVacio.classList.add('hidden');
            filtrados.forEach(ingreso => {
                totalAcumulado += parseFloat(ingreso.monto);
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${ingreso.nombre_alumno}</strong></td>
                    <td>${ingreso.tipo}</td>
                    <td class="monto-positivo">$${ingreso.monto.toLocaleString('es-AR')}</td>
                    <td>${ingreso.fecha ? ingreso.fecha.split('-').reverse().join('/') : '--'}</td>
                    <td>
                        <button class="btn-editar" onclick="prepararEdicion(${ingreso.id})">✏️</button>
                        <button class="eliminar" onclick="eliminarIngreso(${ingreso.id})">❌</button>
                    </td>
                `;
                tablaIngresos.appendChild(tr);
            });
            if(resultadoResumen) resultadoResumen.innerHTML = `Total del período: <strong>$${totalAcumulado.toLocaleString('es-AR')}</strong>`;
        }
    }

    // ==========================================
    // 5. NUEVA LÓGICA: SUMATORIA RÁPIDA EN INICIO
    // ==========================================
    function calcularSumatoriaMesActual() {
        const mesHoy = new Date().toISOString().substring(0, 7);
        const registrosMes = ingresos.filter(i => i.fecha && i.fecha.startsWith(mesHoy));
        const sumaTotal = registrosMes.reduce((acc, curr) => acc + parseFloat(curr.monto || 0), 0);
        
        if (montoTotalDinamico && visorTotalRapido) {
            montoTotalDinamico.textContent = `$ ${sumaTotal.toLocaleString('es-AR')}`;
            visorTotalRapido.classList.remove('hidden');
        }
    }

    // ==========================================
    // 6. EVENTOS DE LOS BOTONES DE INICIO
    // ==========================================
    document.getElementById('btn-ingresar').addEventListener('click', () => {
        formTitulo.textContent = "Nuevo ingreso";
        mostrarSeccion(formSection);
    });

    document.getElementById('btn-ver-lista').addEventListener('click', () => {
        filtroMesDinamico.value = "todos";
        mostrarSeccion(listaSection);
        renderizarTabla();
    });

    // BOTÓN CORREGIDO: Ahora calcula la suma sin salir del menú
    document.getElementById('btn-mes-actual-inicio').addEventListener('click', () => {
        calcularSumatoriaMesActual();
    });

    document.getElementById('btn-historial-inicio').addEventListener('click', () => {
        mostrarSeccion(listaSection);
        renderizarTabla();
        filtroMesDinamico.focus(); 
    });

    // ==========================================
    // 7. FUNCIONES DE APOYO Y FEEDBACK
    // ==========================================
    window.prepararEdicion = function(id) {
        const item = ingresos.find(i => i.id === id);
        if (!item) return;

        inputId.value = item.id;
        inputNombre.value = item.nombre_alumno;
        inputTipo.value = item.tipo;
        inputMonto.value = item.monto;
        inputFecha.value = item.fecha;

        formTitulo.textContent = "Editar ingreso";
        mostrarSeccion(formSection);
    };

    window.eliminarIngreso = async function(id) {
        if (!confirm("¿Seguro que desea eliminar este registro?")) return;
        try {
            const res = await fetch(`/api/ingresos/${id}`, { method: 'DELETE' });
            if (res.ok) {
                mostrarConfirmacion("Eliminado correctamente");
                await cargarIngresos();
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    };

    function mostrarConfirmacion(msj) {
        const div = document.createElement('div');
        div.className = 'mensaje-confirmacion';
        div.innerHTML = `<span class="icono-check">✔</span> ${msj}`;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }

    // Inicialización
    formAlumno.addEventListener('submit', guardarIngreso);
    filtroMesDinamico.addEventListener('change', renderizarTabla);
    cargarIngresos();
});