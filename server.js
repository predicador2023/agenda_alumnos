const express = require('express');
const { createClient } = require('@supabase/supabase-client');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Conexión a Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// --- RUTAS DE ALUMNOS ---

app.post('/api/alumnos', async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: "El nombre es obligatorio" });

    const { data, error } = await supabase
      .from('alumnos')
      .insert([{ nombre }])
      .select();

    if (error) {
      console.error("Error Supabase Alumnos:", error);
      return res.status(400).json(error);
    }
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: "Error interno" });
  }
});

app.get('/api/alumnos', async (req, res) => {
  const { data, error } = await supabase.from('alumnos').select('*');
  if (error) return res.status(400).json(error);
  res.json(data);
});

// --- RUTAS DE INGRESOS ---

app.get('/api/ingresos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ingresos')
      .select('*, alumnos(nombre)')
      .order('fecha', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ingresos', async (req, res) => {
  try {
    const { alumno_id, tipo, monto, fecha, observacion } = req.body;

    const { data, error } = await supabase
      .from('ingresos')
      .insert([{ 
        alumno_id, 
        tipo, 
        monto, 
        fecha, 
        observacion: observacion || "" 
      }])
      .select();

    if (error) {
      console.error("Error Supabase Ingresos:", error);
      return res.status(400).json(error);
    }
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: "Error interno" });
  }
});

app.delete('/api/ingresos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('ingresos').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: "Eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});