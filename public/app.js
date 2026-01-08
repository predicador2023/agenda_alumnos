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
    try {
      const res = await fetch('/api/ingresos');
      ingresos = await res.json();

      tablaIngresos.innerHTML = "";
      ingresos.forEach(i => {
        const fila = document.createElement('tr');
        // Usamos i.alumnos.nombre si el join funciona, sino el ID
        const nombreAlumno = i.alumnos ? i.alumnos.nombre : 'ID: ' + i.alumno_id;
        
        fila.innerHTML = `
          <td>${nombreAlumno}</td>
          <td>${i.tipo}</td>
          <td>$${Number(i.monto).toLocaleString('es-AR')}</td>
          <td>${i.fecha}</td>
          <td>
            <button class="eliminar" data-id="${i.id}">❌</button>
          </td>
        `;
        
        fila.querySelector('.eliminar').addEventListener('click', async () => {
          if(confirm('¿Seguro que quieres eliminar este registro?')) {
            await fetch(`/api/ingresos/${i.id}`, { method: 'DELETE' });
            await cargarIngresos();
          }
        });
        tablaIngresos.appendChild(fila);
      });
    } catch (error) {
      console.error("Error al cargar lista:", error);
    }
  }

  // Guardar alumno + ingreso
  async function guardarIngreso(nombre, tipo, monto, fecha) {
    try {
      // 1. Crear alumno (Supabase devuelve un array con el nuevo registro)
      const alumnoRes = await fetch('/api/alumnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre })
      });
      
      const alumnoData = await alumnoRes.json();
      // Obtenemos el ID del alumno (manejando si viene como objeto o array)
      const alumnoId = Array.isArray(alumnoData) ? alumnoData[0].id : alumnoData.id;

      if (!alumnoId) throw new Error("No se pudo obtener el ID del alumno");

      // 2. Crear ingreso vinculado al alumno_id
      const ingresoRes = await fetch('/api/ingresos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          alumno_id: alumnoId, 
          tipo: tipo, 
          monto: monto, 
          fecha: fecha, // Formato AAAA-MM-DD
          observacion: "" // Campo requerido por tu tabla
        })
      });

      if (!ingresoRes.ok) throw new Error("Error al crear el registro de ingreso");

      alert('¡Ingreso guardado con éxito!');
      await cargarIngresos();
      mostrar(listaSection);

    } catch (error) {
      console.error('Error detallado:', error);
      alert('Error: ' + error.message);
    }
  }

  // Evento submit del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value.trim();
    const tipo = document.getElementById('tipo').value;
    const monto = parseFloat(document.getElementById('monto').value);
    const fechaInput = document.getElementById('fecha').value; 

    // Si el usuario no elige fecha, usamos la de hoy en formato ISO (AAAA-MM-DD)
    const fechaFinal = fechaInput || new Date().toISOString().split('T')[0];

    await guardarIngreso(nombre, tipo, monto, fechaFinal);
    form.reset();
  });

  // Botones principales
  btnIngresar.addEventListener('click', () => mostrar(formSection));
  btnVerLista.addEventListener('click', () => {
    mostrar(listaSection);
    cargarIngresos();
  });

  // Resumen mes actual (Filtrado inteligente por AAAA-MM-DD)
  btnMesActual.addEventListener('click', () => {
    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1; // 1-12
    const anioActual = hoy.getFullYear();

    const ingresosMes = ingresos.filter(i => {
      const partes = i.fecha.split('-'); // Separa "2026-01-08"
      return parseInt(partes[1]) === mesActual && parseInt(partes[0]) === anioActual;
    });

    const total = ingresosMes.reduce((acc, i) => acc + Number(i.monto), 0);
    resultadoResumen.innerHTML = `<strong>Total ${mesActual}/${anioActual}: $${total.toLocaleString('es-AR')}</strong>`;
    tablaMeses.classList.add('hidden');
  });

  // Resumen meses anteriores
  btnMesesAnteriores.addEventListener('click', () => {
    const hoy = new Date();
    const añoAnterior = hoy.getFullYear() - 1;
    cuerpoTabla.innerHTML = "";
    const mesesNombres = [
      "Enero","Febrero","Marzo","Abril","Mayo","Junio",
      "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
    ];

    mesesNombres.forEach((nombreMes, index) => {
      const ingresosMes = ingresos.filter(ing => {
        const partes = ing.fecha.split('-');
        return parseInt(partes[1]) === (index + 1) && parseInt(partes[0]) === añoAnterior;
      });

      const total = ingresosMes.reduce((acc, ing) => acc + Number(ing.monto), 0);
      const fila = document.createElement('tr');
      fila.innerHTML = `<td>${nombreMes} ${añoAnterior}</td><td>$${total.toLocaleString('es-AR')}</td>`;
      cuerpoTabla.appendChild(fila);
    });

    resultadoResumen.textContent = `Ingresos del año anterior (${añoAnterior})`;
    tablaMeses.classList.remove('hidden');
  });
});