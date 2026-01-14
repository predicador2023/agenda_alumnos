
// --- VARIABLES ---
const menuPrincipal = document.getElementById('menu-principal');
const formSection = document.getElementById('form-section');
const listaSection = document.getElementById('lista-section');
const tablaIngresos = document.getElementById('tabla-ingresos');
const montoTotalDinamico = document.getElementById('monto-total-dinamico');

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
    alert("Guardado correctamente");
    location.reload();
});

// --- RENDERIZAR (DIBUJAR TABLA Y SUMAR) ---
function cargarDatos(filtro = 'todos') {
    const ingresos = JSON.parse(localStorage.getItem('ingresos')) || [];
    tablaIngresos.innerHTML = '';
    let suma = 0;

    // Filtramos para ENERO 2026
    const datos = (filtro === 'actual') 
        ? ingresos.filter(i => i.fecha.startsWith('2026-01')) 
        : ingresos;

    datos.forEach(i => {
        suma += parseFloat(i.monto);
        tablaIngresos.innerHTML += `
            <tr>
                <td><strong>${i.nombre}</strong></td>
                <td style="color:green; font-weight:bold;">$ ${parseFloat(i.monto).toLocaleString('es-AR')}</td>
                <td><button onclick="borrar('${i.id}')">🗑️</button></td>
            </tr>
        `;
    });

    montoTotalDinamico.innerText = `$ ${suma.toLocaleString('es-AR')}`;
    document.getElementById('resultado-resumen').innerText = `Total: $ ${suma.toLocaleString('es-AR')}`;
}

// --- BOTONES ---
document.getElementById('btn-ingresar').onclick = () => {
    irA(formSection);
    document.getElementById('fecha').value = "2026-01-14";
};

document.getElementById('btn-ver-lista').onclick = () => {
    irA(listaSection);
    cargarDatos('todos');
};

document.getElementById('btn-mes-actual-inicio').onclick = () => {
    document.getElementById('visor-total-rapido').classList.remove('hidden');
    cargarDatos('actual');
};

window.borrar = (id) => {
    let ingresos = JSON.parse(localStorage.getItem('ingresos')) || [];
    ingresos = ingresos.filter(i => i.id !== id);
    localStorage.setItem('ingresos', JSON.stringify(ingresos));
    cargarDatos();
};