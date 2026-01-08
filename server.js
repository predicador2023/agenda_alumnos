const express = require('express');
const { createClient } = require('@supabase/supabase-client');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.post('/api/alumnos', async (req, res) => {
  try {
    const { nombre } = req.body;
    const { data, error } = await supabase.from('alumnos').insert([{ nombre }]).select();
    if (error) return res.status(400).json(error);
    res.status(201).json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/ingresos', async (req, res) => {
  try {
    const { alumno_id, tipo, monto, fecha, observacion } = req.body;
    const { data, error } = await supabase.from('ingresos').insert([{ 
      alumno_id, tipo, monto, fecha, observacion: observacion || "" 
    }]).select();
    if (error) return res.status(400).json(error);
    res.status(201).json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/ingresos', async (req, res) => {
  try {
    const { data, error } = await supabase.from('ingresos').select('*, alumnos(nombre)').order('fecha', { ascending: false });
    if (error) return res.status(400).json(error);
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));