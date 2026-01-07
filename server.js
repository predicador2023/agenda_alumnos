const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database('./db/agenda_alumnos.db');


app.use(bodyParser.json());
app.use(express.static('public'));

// Crear ingreso
app.post('/api/ingresos', (req, res) => {
  const { alumno, tipo, monto, fecha } = req.body;
  db.run(
    `INSERT INTO ingresos (alumno, tipo, monto, fecha) VALUES (?, ?, ?, ?)`,
    [alumno, tipo, monto, fecha],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID });
    }
  );
});

// Listar ingresos
app.get('/api/ingresos', (req, res) => {
  db.all(`SELECT * FROM ingresos ORDER BY fecha DESC`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Actualizar ingreso
app.put('/api/ingresos/:id', (req, res) => {
  const id = req.params.id;
  const { alumno, tipo, monto, fecha } = req.body;
  db.run(
    `UPDATE ingresos SET alumno = ?, tipo = ?, monto = ?, fecha = ? WHERE id = ?`,
    [alumno, tipo, monto, fecha, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ updatedID: id });
    }
  );
});

// Eliminar ingreso
app.delete('/api/ingresos/:id', (req, res) => {
  const id = req.params.id;
  db.run(`DELETE FROM ingresos WHERE id = ?`, id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ deletedID: id });
  });
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});