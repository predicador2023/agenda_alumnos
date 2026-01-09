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

  // 1. Cargar ingresos desde backend
  async function cargarIngresos() {
    try {
      const res = await fetch('/api/ingresos');
      ingresos = await res.json();

      tablaIngresos.innerHTML = "";
      ingresos.forEach(i => {
        const fila = document.createElement('tr');
        
        // Usamos nombre_alumno que es la nueva columna de texto
        const nombreMostrar = i.nombre_alumno || 'Sin nombre';
        
        fila.innerHTML = `
          <td>${nombreMostrar}</td>
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

  // 2. Guardar ingreso (Simplificado: directo a ingresos)
  async function guardarIngreso(nombre, tipo, monto, fecha) {
    try {
      // Enviamos el nombre directamente como texto al backend
      const ingresoRes = await fetch('/api/ingresos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nombre_alumno: nombre, 
          tipo: tipo, 
          monto: monto, 
          fecha: fecha, 
          observacion: "" 
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

  // 3. Evento submit del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Capturamos 'nombre' que es el ID del input en tu HTML
    const nombreValor = document.getElementById('nombre').value.trim();
    const tipoValor = document.getElementById('tipo').value;
    const montoValor = parseFloat(document.getElementById('monto').value);
    const fechaInput = document.getElementById('fecha').value; 

    const fechaFinal = fechaInput || new Date().toISOString().split('T')[0];

    await guardarIngreso(nombreValor, tipoValor, montoValor, fechaFinal);
    form.reset();
  });

  // Botones de navegación
  btnIngresar.addEventListener('click', () => mostrar(formSection));
  btnVerLista.addEventListener('click', () => {
    mostrar(listaSection);
    cargarIngresos();
  });

  // Resumen mes actual
  btnMesActual.addEventListener('click', () => {
    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1;
    const anioActual = hoy.getFullYear();

    const ingresosMes = ingresos.filter(i => {
      if(!i.fecha) return false;
      const partes = i.fecha.split('-'); 
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
    const mesesNombres = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

    mesesNombres.forEach((nombreMes, index) => {
      const ingresosMes = ingresos.filter(ing => {
        if(!ing.fecha) return false;
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