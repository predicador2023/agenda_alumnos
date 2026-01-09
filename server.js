const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 1. Guardar Ingresos (Actualizado para nombre_alumno como texto)
app.post('/api/ingresos', async (req, res) => {
  try {
    const { nombre_alumno, tipo, monto, fecha, observacion } = req.body;
    
    const { data, error } = await supabase
      .from('ingresos')
      .insert([{ 
        nombre_alumno, 
        tipo, 
        monto: parseFloat(monto), 
        fecha, 
        observacion: observacion || "" 
      }])
      .select();

    if (error) {
      console.error("Error Supabase Insert:", error);
      return res.status(400).json(error);
    }
    res.status(201).json(data);
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
});

// 2. Cargar Ingresos (CORREGIDO: Ya no pide datos de la tabla 'alumnos')
app.get('/api/ingresos', async (req, res) => {
  try {
    // Solo seleccionamos las columnas reales de la tabla ingresos
    const { data, error } = await supabase
      .from('ingresos')
      .select('*') 
      .order('fecha', { ascending: false });

    if (error) {
      console.error("Error Supabase Get:", error);
      return res.status(400).json(error);
    }
    res.json(data);
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
});

// 3. Eliminar Ingreso (Para que funcione el botón de la X)
app.delete('/api/ingresos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('ingresos').delete().eq('id', id);
    if (error) return res.status(400).json(error);
    res.json({ message: "Eliminado correctamente" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor activo en puerto ${PORT}`));