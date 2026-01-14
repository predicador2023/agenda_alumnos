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
  
  // Elementos del Filtro Estrella
  const filtroMesDinamico = document.getElementById('filtro-mes-dinamico');
  const grupoMesesHistorial = document.getElementById('grupo-meses-historial');
  const mensajeVacio = document.getElementById('mensaje-vacio');

  let ingresos = [];

  function mostrar(seccion) {
    [formSection, listaSection].forEach(s => s.classList.add('hidden'));
    seccion.classList.remove('hidden');
  }

  // 1. Cargar ingresos desde la API
  async function cargarIngresos() {
    try {
      const res = await fetch('/api/ingresos');
      ingresos = await res.json();
      
      actualizarMenuMeses(); // Poblar el selector de meses
      renderizarTabla();     // Dibujar la tabla según el filtro
    } catch (error) {
      console.error("Error al cargar lista:", error);
    }
  }

  // Llena el selector con los meses que existen en la base de datos
  function actualizarMenuMeses() {
    if (!grupoMesesHistorial) return;
    grupoMesesHistorial.innerHTML = ""; 

    const periodos = [...new Set(ingresos.map(i => {
      return i.fecha ? i.fecha.substring(0, 7) : null;
    }))].filter(Boolean).sort().reverse();

    const nombresMeses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

    periodos.forEach(p => {
      const [anio, mes] = p.split('-');
      const option = document.createElement('option');
      option.value = p;
      option.textContent = `${nombresMeses[parseInt(mes)-1]} ${anio}`;
      grupoMesesHistorial.appendChild(option);
    });
  }

  function renderizarTabla() {
    tablaIngresos.innerHTML = "";
    const filtro = filtroMesDinamico.value;
    
    let datosFiltrados = ingresos;

    // Filtrado por mes
    if (filtro === "actual") {
      const hoy = new Date();
      const mesActual = (hoy.getMonth() + 1).toString().padStart(2, '0');
      const anioActual = hoy.getFullYear();
      const periodoActual = `${anioActual}-${mesActual}`;
      datosFiltrados = ingresos.filter(i => i.fecha && i.fecha.startsWith(periodoActual));
    } else if (filtro !== "todos") {
      datosFiltrados = ingresos.filter(i => i.fecha && i.fecha.startsWith(filtro));
    }

    if (datosFiltrados.length === 0) {
      mensajeVacio.classList.remove('hidden');
    } else {
      mensajeVacio.classList.add('hidden');
      
      datosFiltrados.forEach(i => {
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
        
        fila.querySelector('.eliminar').addEventListener('click', async () => {
          if(confirm(`¿Eliminar registro de ${nombreMostrar}?`)) {
            await fetch(`/api/ingresos/${i.id}`, { method: 'DELETE' });
            cargarIngresos();
          }
        });

        fila.querySelector('.btn-editar').addEventListener('click', () => {
          prepararEdicion(i);
        });

        tablaIngresos.appendChild(fila);
      });
    }
  }

  // Evento para cuando el usuario cambia de mes
  filtroMesDinamico.addEventListener('change', renderizarTabla);

  function prepararEdicion(ingreso) {
    formTitulo.textContent = "Editando alumno";
    btnSubmit.textContent = "Confirmar";
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
        cancelarEdicion();
        await cargarIngresos();
        mostrar(listaSection);
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  });

  btnIngresar.addEventListener('click', () => {
    cancelarEdicion();
    mostrar(formSection);
  });
  
  btnVerLista.addEventListener('click', () => {
    filtroMesDinamico.value = "actual"; 
    mostrar(listaSection);
    cargarIngresos();
  });

  // Carga inicial
  cargarIngresos();
});