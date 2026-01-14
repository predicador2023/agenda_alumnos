document.addEventListener('DOMContentLoaded', () => {
  // Elementos del DOM
  const btnIngresar = document.getElementById('btn-ingresar');
  const btnVerLista = document.getElementById('btn-ver-lista');
  const formSection = document.getElementById('form-section');
  const listaSection = document.getElementById('lista-section');
  const form = document.getElementById('form-alumno');
  const tablaIngresos = document.getElementById('tabla-ingresos');
  const formTitulo = document.getElementById('form-titulo');
  const btnSubmit = document.getElementById('btn-submit');
  const btnCancelar = document.getElementById('btn-cancelar');
  const editIdInput = document.getElementById('edit-id');

  const btnMesActual = document.getElementById('btn-mes-actual');
  const btnMesesAnteriores = document.getElementById('btn-meses-anteriores');
  const resultadoResumen = document.getElementById('resultado-resumen');
  const tablaMeses = document.getElementById('tabla-meses-anteriores');
  const cuerpoTabla = document.getElementById('cuerpo-tabla-meses');

  let ingresos = [];

  function mostrar(seccion) {
    [formSection, listaSection].forEach(s => s.classList.add('hidden'));
    seccion.classList.remove('hidden');
  }

  // 1. Cargar ingresos (Read)
  async function cargarIngresos() {
    try {
      const res = await fetch('/api/ingresos');
      ingresos = await res.json();
      renderizarTabla();
    } catch (error) {
      console.error("Error al cargar lista:", error);
    }
  }

  function renderizarTabla() {
    tablaIngresos.innerHTML = "";
    ingresos.forEach(i => {
      const fila = document.createElement('tr');
      const nombreMostrar = i.nombre_alumno || 'Sin nombre';
      
      fila.innerHTML = `
        <td>${nombreMostrar}</td>
        <td>${i.tipo}</td>
        <td>$${Number(i.monto).toLocaleString('es-AR')}</td>
        <td>${i.fecha || 'S/F'}</td>
        <td>
          <button class="btn-editar" data-id="${i.id}">✏️</button>
          <button class="eliminar" data-id="${i.id}">❌</button>
        </td>
      `;
      
      // Evento Eliminar
      fila.querySelector('.eliminar').addEventListener('click', async () => {
        if(confirm(`¿Eliminar registro de ${nombreMostrar}?`)) {
          await fetch(`/api/ingresos/${i.id}`, { method: 'DELETE' });
          cargarIngresos();
        }
      });

      // Evento Editar
      fila.querySelector('.btn-editar').addEventListener('click', () => {
        prepararEdicion(i);
      });

      tablaIngresos.appendChild(fila);
    });
  }

  function prepararEdicion(ingreso) {
    formTitulo.textContent = "Editando alumno";
    btnSubmit.textContent = "Confirmar Cambios";
    btnCancelar.classList.remove('hidden');
    formSection.classList.add('modo-edicion');

    editIdInput.value = ingreso.id;
    document.getElementById('nombre').value = ingreso.nombre_alumno;
    document.getElementById('tipo').value = ingreso.tipo;
    document.getElementById('monto').value = ingreso.monto;
    document.getElementById('fecha').value = ingreso.fecha;

    mostrar(formSection);
    window.scrollTo(0, 0);
  }

  window.cancelarEdicion = () => {
    form.reset();
    editIdInput.value = "";
    formTitulo.textContent = "Nuevo ingreso";
    btnSubmit.textContent = "Guardar ingreso";
    btnCancelar.classList.add('hidden');
    formSection.classList.remove('modo-edicion');
  };

  btnCancelar.addEventListener('click', cancelarEdicion);

  // 2. Guardar o Actualizar
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const idParaEditar = editIdInput.value;
    const datos = {
      nombre_alumno: document.getElementById('nombre').value.trim(),
      tipo: document.getElementById('tipo').value,
      monto: parseFloat(document.getElementById('monto').value),
      fecha: document.getElementById('fecha').value || new Date().toISOString().split('T')[0]
    };

    try {
      let url = '/api/ingresos';
      let metodo = 'POST';

      if (idParaEditar) {
        url = `/api/ingresos/${idParaEditar}`;
        metodo = 'PUT';
      }

      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });

      if (res.ok) {
        alert(idParaEditar ? '¡Cambios guardados!' : '¡Ingreso guardado!');
        cancelarEdicion();
        await cargarIngresos();
        mostrar(listaSection);
      }
    } catch (error) {
      alert("Error al procesar: " + error.message);
    }
  });

  // Navegación
  btnIngresar.addEventListener('click', () => {
    cancelarEdicion();
    mostrar(formSection);
  });
  
  btnVerLista.addEventListener('click', () => {
    mostrar(listaSection);
    cargarIngresos();
  });

  // Resumen Mes Actual
  btnMesActual.addEventListener('click', () => {
    const hoy = new Date();
    const mes = hoy.getMonth() + 1;
    const anio = hoy.getFullYear();
    const ingresosMes = ingresos.filter(i => {
      if(!i.fecha) return false;
      const p = i.fecha.split('-'); 
      return parseInt(p[1]) === mes && parseInt(p[0]) === anio;
    });
    const total = ingresosMes.reduce((acc, i) => acc + Number(i.monto), 0);
    resultadoResumen.innerHTML = `<strong>Total ${mes}/${anio}: $${total.toLocaleString('es-AR')}</strong>`;
    tablaMeses.classList.add('hidden');
  });

  // Meses Anteriores (Orden Inverso: Diciembre a Enero)
  btnMesesAnteriores.addEventListener('click', () => {
    const hoy = new Date();
    const anioAnterior = hoy.getFullYear() - 1;
    cuerpoTabla.innerHTML = "";

    const nombresMeses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

    // Invertimos el orden para que Diciembre sea el primero en la lista
    const mesesInvertidos = nombresMeses.map((nombre, idx) => ({ 
        nombre, 
        numero: idx + 1 
    })).reverse();

    mesesInvertidos.forEach(mes => {
        const mesIngresos = ingresos.filter(ing => {
            if(!ing.fecha) return false;
            const p = ing.fecha.split('-');
            return parseInt(p[1]) === mes.numero && parseInt(p[0]) === anioAnterior;
        });

        const total = mesIngresos.reduce((acc, ing) => acc + Number(ing.monto), 0);
        
        const fila = document.createElement('tr');
        fila.innerHTML = `<td>${mes.nombre} ${anioAnterior}</td><td>$${total.toLocaleString('es-AR')}</td>`;
        cuerpoTabla.appendChild(fila);
    });

    resultadoResumen.textContent = `Ingresos de ${anioAnterior}`;
    tablaMeses.classList.remove('hidden');
  });
 // --- EL GATILLO AUTOMÁTICO ---
  // Ejecutamos esto para que 'ingresos' ya tenga datos apenas abre la app
  cargarIngresos();
}); // CIERRE FINAL CORRECTO DEL DOMContentLoaded