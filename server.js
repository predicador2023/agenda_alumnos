const express = require('express');
const { createClient } = require('@supabase/supabase-client');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Sirve tu HTML, CSS y app.js

// Conexión a Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// -----------------------------------------------------------
// RUTAS DE ALUMNOS
// -----------------------------------------------------------

// Crear un nuevo alumno
app.post('/api/alumnos', async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const { data, error } = await supabase
      .from('alumnos')
      .insert([{ nombre }])
      .select(); // DEVUELVE EL ID generado para usarlo en ingresos

    if (error) {
      console.error("Error al insertar alumno:", error);
      return res.status(400).json(error);
    }
    res.status(201).json(data);
  } catch (err) {
    console.error("Error 500 en Alumnos:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener lista de alumnos (opcional, por si la necesitas luego)
app.get('/api/alumnos', async (req, res) => {
  const { data, error } = await supabase.from('alumnos').select('*');
  if (error) return res.status(400).json(error);
  res.json(data);
});

// -----------------------------------------------------------
// RUTAS DE INGRESOS
// -----------------------------------------------------------

// Obtener todos los ingresos con el nombre del alumno relacionado
app.get('/api/ingresos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ingresos')
      .select('*, alumnos(nombre)') // Join para traer el nombre del alumno
      .order('fecha', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Error al obtener ingresos:", err);
    res.status(500).json({ error: err.message });
  }
});

// Crear un nuevo ingreso vinculado a un alumno
app.post('/api/ingresos', async (req, res) => {
  try {
    const { alumno_id, tipo, monto, fecha, observacion } = req.body;

    // Insertamos los datos incluyendo 'observacion' que vimos en tu tabla
    const { data, error } = await supabase
      .from('ingresos')
      .insert([{ 
        alumno_id, 
        tipo, 
        monto, 
        fecha, 
        observacion: observacion || "" // Evita errores si viene vacío
      }])
      .select();

    if (error) {
      console.error("Error al insertar ingreso:", error);
      return res.status(400).json(error);
    }
    res.status(201).json(data);
  } catch (err) {
    console.error("Error 500 en Ingresos:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Eliminar un ingreso por ID
app.delete('/api/ingresos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('ingresos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error al eliminar:", error);
      return res.status(400).json(error);
    }
    res.json({ message: "Registro eliminado con éxito" });
  } catch (err) {
    res.status(500).json({ error: "Error al procesar la eliminación" });
  }
});

// -----------------------------------------------------------
// INICIO DEL SERVIDOR
// -----------------------------------------------------------
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor activo en el puerto ${PORT}`);
  console.log(`URL de la base de datos configurada: ${process.env.SUPABASE_URL ? 'SÍ' : 'NO'}`);
});