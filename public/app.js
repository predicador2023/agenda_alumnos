document.addEventListener('DOMContentLoaded', () => {
  const btnIngresar = document.getElementById('btn-ingresar');
  const btnVerLista = document.getElementById('btn-ver-lista');
  const formSection = document.getElementById('form-section');
  const listaSection = document.getElementById('lista-section');
  const tablaIngresos = document.getElementById('tabla-ingresos');
  const form = document.getElementById('form-alumno');

  const btnMesActual = document.getElementById('btn-mes-actual');
  const btnMesesAnteriores = document.getElementById('btn-meses-anteriores');
  const resultadoResumen = document.getElementById('resultado-resumen');
  const tablaMeses = document.getElementById('tabla-meses-anteriores');
  const cuerpoTabla = document.getElementById('cuerpo-tabla-meses');

  let filaEditando = null;
  let idEditando = null;
  let ingresos = [];

  // --- Funciones auxiliares ---
  function filtrarPorMes(ingresos, mes, año) {
    return ingresos.filter(i => {
      const f = new Date(i.fecha);
      return f.getMonth() + 1 === mes && f.getFullYear() === año;
    });
  }

  function calcularTotal(ingresosMes) {
    return ingresosMes.reduce((acc, i) => acc + i.monto, 0);
  }

  async function cargarIngresos() {
    const res = await fetch('/api/ingresos');
    ingresos = await res.json();

    tablaIngresos.innerHTML = "";
    ingresos.forEach(i => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${i.alumno}</td>
        <td>${i.tipo}</td>
        <td>$${i.monto.toFixed(2)}</td>
        <td>${i.fecha}</td>
        <td>
          <button class="editar" title="Editar">✏️</button>
          <button class="eliminar" title="Eliminar">❌</button>
        </td>
      `;
      tablaIngresos.appendChild(fila);

      fila.querySelector('.editar').addEventListener('click', () => {
        filaEditando = fila;
        idEditando = i.id;
        document.getElementById('nombre').value = i.alumno;
        document.getElementById('tipo').value = i.tipo;
        document.getElementById('monto').value = i.monto;
        document.getElementById('fecha').value = i.fecha;
        formSection.classList.remove('hidden');
        listaSection.classList.add('hidden');
      });

      fila.querySelector('.eliminar').addEventListener('click', async () => {
        await fetch(`/api/ingresos/${i.id}`, { method: 'DELETE' });
        await cargarIngresos();
      });
    });
  }

  async function guardarIngreso(alumnoId, tipo, monto, fecha, observacion) {
  if (idEditando) {
    await fetch(`/api/ingresos/${idEditando}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alumno_id: alumno_id, tipo, monto, fecha, observacion })
    });
    idEditando = null;
  } else {
    await fetch('/api/ingresos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alumno_id: alumnoId, tipo, monto, fecha, observacion })
    });
  }
  await cargarIngresos();
}

  // --- Botón: ver mes actual ---
  btnMesActual.addEventListener('click', () => {
    const hoy = new Date();
    const mes = hoy.getMonth() + 1;
    const año = hoy.getFullYear();
    const nombreMes = hoy.toLocaleString('es-ES', { month: 'long' });
    const ingresosMes = filtrarPorMes(ingresos, mes, año);
    const total = calcularTotal(ingresosMes);
    resultadoResumen.textContent = `${nombreMes} ${año}: $${total.toFixed(2)}`;
    tablaMeses.classList.add('hidden');
  });

  // --- Botón: ver meses anteriores ---
  btnMesesAnteriores.addEventListener('click', () => {
    const hoy = new Date();
    const añoAnterior = hoy.getFullYear() - 1;
    cuerpoTabla.innerHTML = "";

    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    for (let i = 11; i >= 0; i--) {
      const ingresosMes = filtrarPorMes(ingresos, i + 1, añoAnterior);
      const total = calcularTotal(ingresosMes);
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${meses[i]}</td>
        <td>${total > 0 ? `$${total.toFixed(2)}` : "0"}</td>
      `;
      cuerpoTabla.appendChild(fila);
    }

    resultadoResumen.textContent = `Ingresos del año ${añoAnterior}`;
    tablaMeses.classList.remove('hidden');
  });

  // --- Botones principales ---
  btnIngresar.addEventListener('click', () => {
    formSection.classList.toggle('hidden');
    listaSection.classList.add('hidden');
    filaEditando = null;
    idEditando = null;
    form.reset();
  });

  btnVerLista.addEventListener('click', () => {
    listaSection.classList.toggle('hidden');
    formSection.classList.add('hidden');
    cargarIngresos();
  });

  // --- Formulario: guardar alumno ---
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

    // 🔔 Mensaje de confirmación personalizado con icono animado y sonido
    const confirmacion = document.createElement('div');
    confirmacion.classList.add('mensaje-confirmacion');

    const icono = document.createElement('span');
    icono.classList.add('icono-check');
    icono.textContent = "✅";

    const texto = document.createElement('span');
    texto.textContent = ` Alumno "${nombre}" guardado con éxito. Monto: $${monto.toFixed(2)} (${tipo})`;

    confirmacion.appendChild(icono);
    confirmacion.appendChild(texto);
    document.body.appendChild(confirmacion);

    // 🎵 Sonido de confirmación
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
    } catch (err) {
      console.warn("No se pudo reproducir sonido:", err);
    }

    setTimeout(() => {
      confirmacion.remove();
    }, 3000);

    form.reset();
    formSection.classList.add('hidden');
    listaSection.classList.remove('hidden');
  });

  // --- Inicializar ---
  cargarIngresos();
});