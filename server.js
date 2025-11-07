const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Modelo de Usuario
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  name: String
});

// Modelo de Libros (CORREGIDO)
const librosSchema = new mongoose.Schema({
  titulo: String,  // 'String' con mayúscula
  autor: String    // 'String' con mayúscula
});

const User = mongoose.model('User', userSchema);
const Libro = mongoose.model('Libros', librosSchema); // CREAR EL MODELO

// Ruta de Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username, password });
    
    if (user) {
      res.json({
        success: true,
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
          name: user.name
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Datos de usuario inválidos'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error de servidor'
    });
  }
});

// Ruta para obtener libros (CORREGIDO)
app.get('/api/libros', async (req, res) => { 
  try {
    const libros = await Libro.find(); // Usar el modelo Libro con .find()
    res.json(libros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para crear un libro (OPCIONAL)
app.post('/api/libros', async (req, res) => {
  try {
    const nuevoLibro = new Libro(req.body);
    await nuevoLibro.save();
    res.status(201).json(nuevoLibro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});