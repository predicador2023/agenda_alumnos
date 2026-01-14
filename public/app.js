document.addEventListener('DOMContentLoaded', () => {
    // SELECTORES ORIGINALES
    const menuPrincipal = document.getElementById('menu-principal');
    const formSection = document.getElementById('form-section');
    const listaSection = document.getElementById('lista-section');
    const formAlumno = document.getElementById('form-alumno');
    const tablaIngresos = document.getElementById('tabla-ingresos');
    const filtroMesDinamico = document.getElementById('filtro-mes-dinamico');
    const grupoMesesHistorial = document.getElementById('grupo-meses-historial');
    const mensajeVacio = document.getElementById('mensaje-vacio');
    
    // Selectores para el Visor Verde (Caja de sumatoria)
    const visorTotalRapido = document.getElementById('visor-total-rapido');
    const montoTotalDinamico = document.getElementById('monto-total-dinamico');

    const inputId = document.getElementById('edit-id');
    const inputNombre = document.getElementById('nombre');
    const inputTipo = document.getElementById('tipo');
    const inputMonto = document.getElementById('monto');
    const inputFecha = document.getElementById('fecha');
    const formTitulo = document.getElementById('form-titulo');

    let ingresos = [];

    // NAVEGACIÓN ORIGINAL
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

    // LÓGICA DE CARGA (API)
    async function cargarIngresos() {
        try {
            const response = await fetch('/api/ingresos'); 
            ingresos = await response.json();
            actualizarSelectorMeses();
            renderizarTabla();
        } catch (error) {
            console.error("Error cargando ingresos:", error);
            const local = localStorage.getItem('ingresos_backup');
            if (local) ingresos = JSON.parse(local);
            renderizarTabla();
        }
    }

    // LÓGICA DE SUMATORIA (Botón Mes Actual de la foto)
    function calcularSumatoriaMesActual() {
        const mesActual = new Date().toISOString().substring(0, 7);
        const filtrados = ingresos.filter(i => i.fecha && i.fecha.startsWith(mesActual));
        const total = filtrados.reduce((acc, curr) => acc + parseFloat(curr.monto || 0), 0);
        
        // Actualizamos el número en el cuadro verde
        montoTotalDinamico.textContent = `$ ${total.toLocaleString('es-AR')}`;
        visorTotalRapido.classList.remove('hidden');
    }

    // RENDERIZAR TABLA ORIGINAL
    function renderizarTabla() {
        if(!tablaIngresos) return;
        tablaIngresos.innerHTML = "";
        const filtro = filtroMesDinamico.value;
        const mesActual = new Date().toISOString().substring(0, 7);

        let filtrados = ingresos;
        if (filtro === "actual") filtrados = ingresos.filter(i => i.fecha && i.fecha.startsWith(mesActual));
        else if (filtro !== "todos") filtrados = ingresos.filter(i => i.fecha && i.fecha.startsWith(filtro));

        if (filtrados.length === 0) {
            mensajeVacio.classList.remove('hidden');
        } else {
            mensajeVacio.classList.add('hidden');
            filtrados.forEach(i => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${i.nombre_alumno}</strong></td>
                    <td>$${i.monto}</td>
                    <td><button onclick="prepararEdicion(${i.id})">✏️</button></td>
                `;
                tablaIngresos.appendChild(tr);
            });
        }
    }

    // EVENTOS BOTONES INICIO
    document.getElementById('btn-ingresar').addEventListener('click', () => {
        formTitulo.textContent = "Nuevo ingreso";
        mostrarSeccion(formSection);
    });

    document.getElementById('btn-ver-lista').addEventListener('click', () => {
        filtroMesDinamico.value = "todos";
        mostrarSeccion(listaSection);
        renderizarTabla();
    });

    // ESTE ES EL BOTÓN DE TU FOTO (Ver mes actual)
    document.getElementById('btn-mes-actual-inicio').addEventListener('click', () => {
        calcularSumatoriaMesActual();
    });

    document.getElementById('btn-historial-inicio').addEventListener('click', () => {
        mostrarSeccion(listaSection);
        renderizarTabla();
    });

    cargarIngresos();
});