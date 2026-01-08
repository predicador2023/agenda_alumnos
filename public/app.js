document.addEventListener('DOMContentLoaded', () => {
  // Botones y secciones
  const btnIngresar = document.getElementById('btn-ingresar');
  const btnVerLista = document.getElementById('btn-ver-lista');
  const formSection = document.getElementById('form-section');
  const listaSection = document.getElementById('lista-section');
  const form = document.getElementById('form-alumno');
  const tablaIngresos = document.getElementById('tabla-ingresos');

  const btnMesActual = document.getElementById('btn-mes-actual');
  const btnMesesAnteriores = document.getElementById('btn-meses-anteriores');
  const resultadoResumen = document.getElementById('resultado-resumen');
  const tablaMeses = document.getElementById('tabla-meses-anteriores');
  const cuerpoTabla = document.getElementById('cuerpo-tabla-meses');

  let ingresos = [];

  // Mostrar secciones
  function mostrar(seccion) {
    [formSection, listaSection].forEach(s => s.classList.add('hidden'));
    seccion.classList.remove('hidden');
  }

  // Cargar ingresos desde backend
  async function cargarIngresos() {
    const res = await fetch('/api/ingresos');
    ingresos = await res.json();

    tablaIngresos.innerHTML = "";
    ingresos.forEach(i => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${i.alumnos ? i.alumnos.nombre : i.alumno_id}</td>
        <td>${i.tipo}</td>
        <td>$${Number(i.monto).toFixed(2)}</td>
        <td>${i.fecha}</td>
        <td>
          <button class="eliminar">❌</button>
        </td>
      `;
      fila.querySelector('.eliminar').addEventListener('click', async () => {
        await fetch(`/api/ingresos/${i.id}`, { method: 'DELETE' });
        await cargarIngresos();
      });
      tablaIngresos.appendChild(fila);
    });
  }

  // Guardar alumno + ingreso
 async function guardarIngreso(nombre, tipo, monto, fecha) {
  try {
    // 1. Crear alumno
    const alumnoRes = await fetch('/api/alumnos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre })
    });

    if (!alumnoRes.ok) throw new Error('Error al crear alumno');
    
    const alumnoData = await alumnoRes.json();
    
    // IMPORTANTE: Verificamos si recibimos el ID (algunas APIs devuelven el objeto directo o en un array)
    const alumnoId = Array.isArray(alumnoData) ? alumnoData[0].id : alumnoData.id;

    if (!alumnoId) throw new Error('No se obtuvo el ID del alumno');

    // 2. Crear ingreso usando el ID obtenido
    const ingresoRes = await fetch('/api/ingresos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        alumno_id: alumnoId, 
        tipo: tipo, 
        monto: monto, 
        fecha: fecha 
      })
    });

    if (!ingresoRes.ok) throw new Error('Error al crear el registro de ingreso');

    alert('¡Ingreso guardado con éxito!');
    await cargarIngresos();

  } catch (error) {
    console.error('Error detallado:', error);
    alert('Error al guardar: ' + error.message);
  }
}

  // Evento submit del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value.trim();
    const tipo = document.getElementById('tipo').value;
    const monto = parseFloat(document.getElementById('monto').value);
    const fechaInput = document.getElementById('fecha').value;
    const hoy = new Date();
    const fechaLocal = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
    const fecha = fechaInput || fechaLocal;

    await guardarIngreso(nombre, tipo, monto, fecha);
    form.reset();
    mostrar(listaSection);
  });

  // Botones principales
  btnIngresar.addEventListener('click', () => mostrar(formSection));
  btnVerLista.addEventListener('click', () => {
    mostrar(listaSection);
    cargarIngresos();
  });

  // Resumen mes actual
  btnMesActual.addEventListener('click', () => {
    const hoy = new Date();
    const mes = hoy.getMonth() + 1;
    const año = hoy.getFullYear();
    const ingresosMes = ingresos.filter(i => {
      const f = new Date(i.fecha);
      return f.getMonth() + 1 === mes && f.getFullYear() === año;
    });
    const total = ingresosMes.reduce((acc, i) => acc + Number(i.monto), 0);
    resultadoResumen.textContent = `Total ${mes}/${año}: $${total.toFixed(2)}`;
    tablaMeses.classList.add('hidden');
  });

  // Resumen meses anteriores
  btnMesesAnteriores.addEventListener('click', () => {
    const hoy = new Date();
    const añoAnterior = hoy.getFullYear() - 1;
    cuerpoTabla.innerHTML = "";
    const meses = [
      "Enero","Febrero","Marzo","Abril","Mayo","Junio",
      "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
    ];
    for (let i = 0; i < 12; i++) {
      const ingresosMes = ingresos.filter(ing => {
        const f = new Date(ing.fecha);
        return f.getMonth() === i && f.getFullYear() === añoAnterior;
      });
      const total = ingresosMes.reduce((acc, ing) => acc + Number(ing.monto), 0);
      const fila = document.createElement('tr');
      fila.innerHTML = `<td>${meses[i]}</td><td>$${total.toFixed(2)}</td>`;
      cuerpoTabla.appendChild(fila);
    }
    resultadoResumen.textContent = `Ingresos del año ${añoAnterior}`;
    tablaMeses.classList.remove('hidden');
  });
});