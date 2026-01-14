// --- VARIABLES ---
const menuPrincipal = document.getElementById('menu-principal');
const formSection = document.getElementById('form-section');
const listaSection = document.getElementById('lista-section');
const tablaIngresos = document.getElementById('tabla-ingresos');
const montoTotalDinamico = document.getElementById('monto-total-dinamico');
const visorTotalRapido = document.getElementById('visor-total-rapido');

// --- FUNCIÓN PARA MOSTRAR PANTALLAS ---
function irA(pantalla) {
    menuPrincipal.classList.add('hidden');
    formSection.classList.add('hidden');
    listaSection.classList.add('hidden');
    pantalla.classList.remove('hidden');
}

// --- GUARDAR ---
document.getElementById('form-alumno').addEventListener('submit', (e) => {
    e.preventDefault();
    const ingresos = JSON.parse(localStorage.getItem('ingresos')) || [];
    const nuevo = {
        id: Date.now().toString(),
        nombre: document.getElementById('nombre').value,
        monto: document.getElementById('monto').value,
        fecha: document.getElementById('fecha').value,
        tipo: document.getElementById('tipo').value
    };
    ingresos.push(nuevo);
    localStorage.setItem('ingresos', JSON.stringify(ingresos));
    alert("✅ Guardado correctamente");
    location.reload();
});

// --- RENDERIZAR (MUESTRA ALUMNOS Y SUMA MONTOS) ---
function cargarDatos(filtro = 'todos') {
    const ingresos = JSON.parse(localStorage.getItem('ingresos')) || [];
    tablaIngresos.innerHTML = '';
    let suma = 0;

    // Filtramos para ENERO 2026 (Mes Actual)
    const datos = (filtro === 'actual') 
        ? ingresos.filter(i => i.fecha.startsWith('2026-01')) 
        : ingresos;

    if (datos.length === 0) {
        tablaIngresos.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px;">No hay registros</td></tr>';
    } else {
        datos.forEach(i => {
            const m = parseFloat(i.monto) || 0;
            suma += m;
            tablaIngresos.innerHTML += `
                <tr>
                    <td><strong>${i.nombre}</strong><br><small>${i.fecha}</small></td>
                    <td style="color:green; font-weight:bold; text-align:right;">$ ${m.toLocaleString('es-AR')}</td>
                    <td style="text-align:center;"><button onclick="borrar('${i.id}')" style="border:none; background:none; cursor:pointer;">🗑️</button></td>
                </tr>
            `;
        });
    }

    // Mostrar MONTOS en pantalla
    const totalTexto = `$ ${suma.toLocaleString('es-AR')}`;
    montoTotalDinamico.innerText = totalTexto;
    document.getElementById('resultado-resumen').innerText = `Total: ${totalTexto}`;
}

// --- BOTONES DE NAVEGACIÓN ---

// 1. Botón Ingresar
document.getElementById('btn-ingresar').onclick = () => {
    irA(formSection);
    document.getElementById('fecha').value = "2026-01-14";
};

// 2. Botón Ver Lista Completa
document.getElementById('btn-ver-lista').onclick = () => {
    irA(listaSection);
    document.getElementById('filtro-mes-dinamico').value = "todos";
    cargarDatos('todos');
};

// 3. Botón Mes Actual (Visor Verde)
document.getElementById('btn-mes-actual-inicio').onclick = () => {
    visorTotalRapido.classList.remove('hidden'); // Muestra el cuadro verde
    cargarDatos('actual');
};

// 4. Botón Meses Anteriores (Historial)
document.getElementById('btn-historial-inicio').onclick = () => {
    irA(listaSection);
    // Filtrar todo lo que NO sea Enero 2026
    const ingresos = JSON.parse(localStorage.getItem('ingresos')) || [];
    const historial = ingresos.filter(i => !i.fecha.startsWith('2026-01'));
    
    if (historial.length === 0) {
        alert("📅 Enero 2026 es tu primer mes. No hay historial previo todavía.");
        cargarDatos('actual');
    } else {
        cargarDatos('todos');
    }
};

// 5. Selector de meses dentro de la lista
document.getElementById('filtro-mes-dinamico').onchange = (e) => {
    cargarDatos(e.target.value);
};

// --- BORRAR ---
window.borrar = (id) => {
    if(confirm("¿Seguro que querés borrar este pago?")) {
        let ingresos = JSON.parse(localStorage.getItem('ingresos')) || [];
        ingresos = ingresos.filter(i => i.id !== id);
        localStorage.setItem('ingresos', JSON.stringify(ingresos));
        cargarDatos();
    }
};