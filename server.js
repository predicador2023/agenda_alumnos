// Importar dependencias
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Conexión a Supabase usando variables de entorno
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Crear ingreso
app.post('/api/ingresos', async (req, res) => {
  const { alumno, tipo, monto, fecha } = req.body;

  const { data, error } = await supabase
    .from('ingresos')
    .insert([{ alumno, tipo, monto, fecha }]);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Listar ingresos
app.get('/api/ingresos', async (req, res) => {
  const { data, error } = await supabase
    .from('ingresos')
    .select('*')
    .order('fecha', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Actualizar ingreso
app.put('/api/ingresos/:id', async (req, res) => {
  const id = req.params.id;
  const { alumno, tipo, monto, fecha } = req.body;

  const { data, error } = await supabase
    .from('ingresos')
    .update({ alumno, tipo, monto, fecha })
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Eliminar ingreso
app.delete('/api/ingresos/:id', async (req, res) => {
  const id = req.params.id;

  const { data, error } = await supabase
    .from('ingresos')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Render necesita PORT dinámico
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});