import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// --- Endpoints ---

// Crear alumno
app.post('/api/alumnos', async (req, res) => {
  const { nombre } = req.body;
  const { data, error } = await supabase
    .from('alumnos')
    .insert([{ nombre }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Listar alumnos (opcional)
app.get('/api/alumnos', async (req, res) => {
  const { data, error } = await supabase
    .from('alumnos')
    .select('id, nombre')
    .order('nombre', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Crear ingreso
app.post('/api/ingresos', async (req, res) => {
  const { alumno_id, tipo, monto, fecha, observacion } = req.body;
  const { data, error } = await supabase
    .from('ingresos')
    .insert([{ alumno_id, tipo, monto, fecha, observacion }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Listar ingresos con JOIN a alumnos
app.get('/api/ingresos', async (req, res) => {
  const { data, error } = await supabase
    .from('ingresos')
    .select(`
      id,
      alumno_id,
      tipo,
      monto,
      fecha,
      observacion,
      alumnos (nombre)
    `)
    .order('fecha', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Eliminar ingreso
app.delete('/api/ingresos/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('ingresos')
    .delete()
    .eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// --- Arranque del servidor ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});