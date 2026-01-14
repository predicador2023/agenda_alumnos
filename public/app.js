// ==========================================
// 1. VARIABLES GLOBALES Y SELECCIÓN DE DOM
// ==========================================
const menuPrincipal = document.getElementById('menu-principal');
const formSection = document.getElementById('form-section');
const listaSection = document.getElementById('lista-section');
const formAlumno = document.getElementById('form-alumno');
const tablaIngresos = document.getElementById('tabla-ingresos');
const montoTotalDinamico = document.getElementById('monto-total-dinamico');
const visorTotalRapido = document.getElementById('visor-total-rapido');
const filtroMesDinamico = document.getElementById('filtro-mes-dinamico');
const mensajeVacio = document.getElementById('mensaje-vacio');

// ==========================================
// 2. FUNCIONES DE LÓGICA CORE
// ==========================================

// Obtener datos de localStorage
function obtenerIngresos() {
    return JSON.parse(localStorage.getItem('ingresos')) || [];
}

// Guardar datos en localStorage
function guardarIngresos(ingresos) {
    localStorage.setItem('ingresos', JSON.stringify(ingresos));
}

// Generar el historial de meses dinámicamente
function actualizarSelectorMeses() {
    const grupoHistorial = document.getElementById('grupo-meses-historial');
    if (!grupoHistorial) return;
    
    grupoHistorial.innerHTML = ''; 
    const ingresos = obtenerIngresos();
    const fechaActual = new Date();
    const mesActualKey = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}`;

    // Obtener meses únicos de los datos guardados
    const mesesExistentes = [...new Set(ingresos.map(ing => ing.fecha.substring(0, 7)))];
    // Filtrar para que solo aparezcan los meses anteriores al actual (Enero 2026)
    const mesesAnteriores = mesesExistentes.filter(mes => mes !== mesActualKey);

    if (mesesAnteriores.length === 0) {
        const opt = document.createElement('option');
        opt.disabled = true;
        opt.textContent = "Sin meses anteriores todavía";
        grupoHistorial.appendChild(opt);
    } else {
        mesesAnteriores.sort().reverse().forEach(mes => {
            const [year, month] = mes.split('-');
            const date = new Date(year, month - 1);
            const nombreMes = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(date);
            
            const option = document.createElement('option');
            option.value = mes;
            option.textContent = `${nombreMes.toUpperCase()} ${year}`;
            grupoHistorial.appendChild(option);
        });
    }
}

// Renderizar la tabla y calcular montos
function renderizarTabla(filtro = 'actual') {
    const ingresos = obtenerIngresos();
    const fechaActual = new Date();
    const mesActualKey = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}`;
    
    let datosFiltrados = [];
    if (filtro === 'actual') {
        datosFiltrados = ingresos.filter(ing => ing.fecha.startsWith(mesActualKey));
    } else if (filtro === 'todos') {
        datosFiltrados = ingresos;
    } else {
        datosFiltrados = ingresos.filter(ing => ing.fecha.startsWith(filtro));
    }

    tablaIngresos.innerHTML = '';
    let sumaTotal = 0;

    if (datosFiltrados.length === 0) {
        mensajeVacio.classList.remove('hidden');
    } else {
        mensajeVacio.classList.add('hidden');
        datosFiltrados.forEach(alumno => {
            sumaTotal += parseFloat(alumno.monto);
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td><strong>${alumno.nombre}</strong><br><small>${alumno.tipo}</small></td>
                <td class="monto-valor">$ ${parseFloat(alumno.monto).toLocaleString('es-AR')}</td>
                <td>
                    <button class="btn-borrar" onclick="eliminarRegistro('${alumno.id}')">🗑️</button>
                </td>
            `;
            tablaIngresos.appendChild(fila);
        });
    }

    // Actualizar los montos en la interfaz
    const totalTexto = `$ ${sumaTotal.toLocaleString('es-AR')}`;
    montoTotalDinamico.innerText = totalTexto;
    document.getElementById('resultado-resumen').innerText = `Total: ${totalTexto}`;
}

// Función para eliminar un registro
window.eliminarRegistro = function(id) {
    if (confirm("¿Estás seguro de eliminar este registro de pago?")) {
        const ingresos = obtenerIngresos().filter(ing => ing.id !== id);
        guardarIngresos(ingresos);
        renderizarTabla(filtroMesDinamico.value);
    }
}

// ==========================================
// 3. EVENTOS DE NAVEGACIÓN Y FORMULARIO
// ==========================================

// Botón "Ingresar Alumno"
document.getElementById('btn-ingresar').addEventListener('click', () => {
    menuPrincipal.classList.add('hidden');
    formSection.classList.remove('hidden');
    // Setear fecha de hoy por defecto
    document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
});

// Botón "Ver lista completa"
document.getElementById('btn-ver-lista').addEventListener('click', () => {
    menuPrincipal.classList.add('hidden');
    listaSection.classList.remove('hidden');
    filtroMesDinamico.value = 'todos';
    renderizarTabla('todos');
});

// Botón "Mes Actual" (Desde Inicio)
document.getElementById('btn-mes-actual-inicio').addEventListener('click', () => {
    visorTotalRapido.classList.remove('hidden');
    renderizarTabla('actual');
});

// Botón "Meses Anteriores" (Desde Inicio)
document.getElementById('btn-historial-inicio').addEventListener('click', () => {
    actualizarSelectorMeses();
    menuPrincipal.classList.add('hidden');
    listaSection.classList.remove('hidden');
    tablaIngresos.innerHTML = '';
    mensajeVacio.innerHTML = "📅 Seleccioná un mes para ver el historial";
    mensajeVacio.classList.remove('hidden');
});

// Cambio en el selector de meses
filtroMesDinamico.addEventListener('change', (e) => {
    renderizarTabla(e.target.value);
});

// Enviar Formulario
formAlumno.addEventListener('submit', (e) => {
    e.preventDefault();
    const nuevoIngreso = {
        id: Date.now().toString(),
        nombre: document.getElementById('nombre').value,
        tipo: document.getElementById('tipo').value,
        monto: document.getElementById('monto').value,
        fecha: document.getElementById('fecha').value
    };

    const ingresos = obtenerIngresos();
    ingresos.push(nuevoIngreso);
    guardarIngresos(ingresos);
    
    alert("¡Registro guardado con éxito!");
    location.reload(); // Recarga para volver al inicio prolijamente
});

// Cancelar edición/formulario
window.cancelarEdicion = function() {
    location.reload();
}