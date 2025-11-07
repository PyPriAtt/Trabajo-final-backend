const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  name: String
});

const librosSchema = new mongoose.Schema({
  titulo: String,  
  autor: String   
});


const User = mongoose.model('User', userSchema);
const Libro = mongoose.model('Libro', librosSchema);

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

app.get('/api/users', async (req, res) => {
  try {
    const usuarios = await User.find().select('-password');
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const nuevoUsuario = new User(req.body);
    await nuevoUsuario.save();
    const usuarioSinPassword = nuevoUsuario.toObject();
    delete usuarioSinPassword.password;
    res.status(201).json(usuarioSinPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const datosActualizar = { ...req.body };

    if (!datosActualizar.password) {
      delete datosActualizar.password;
    }

    const usuarioActualizado = await User.findByIdAndUpdate(
      req.params.id,
      datosActualizar,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!usuarioActualizado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuarioActualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const usuarioEliminado = await User.findByIdAndDelete(req.params.id);
    if (!usuarioEliminado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/libros', async (req, res) => { 
  try {
    const libros = await Libro.find();
    res.json(libros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/libros', async (req, res) => {
  try {
    const nuevoLibro = new Libro(req.body);
    await nuevoLibro.save();
    res.status(201).json(nuevoLibro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/libros/:id', async (req, res) => {
  try {
    const libroActualizado = await Libro.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!libroActualizado) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }
    res.json(libroActualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/libros/:id', async (req, res) => {
  try {
    const libroEliminado = await Libro.findByIdAndDelete(req.params.id);
    if (!libroEliminado) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }
    res.json({ message: 'Libro eliminado exitosamente', libro: libroEliminado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const prestamosSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  libro: { type: mongoose.Schema.Types.ObjectId, ref: 'Libro' },
  fechaPrestamo: { type: Date, default: Date.now },
});

const Prestamo = mongoose.model('Prestamo', prestamosSchema);


app.get('/api/prestamos', async (req, res) => {
  try {
    const prestamos = await Prestamo.find()
      .populate('usuario', 'name username')
      .populate('libro', 'titulo autor');
    res.json(prestamos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/api/prestamos', async (req, res) => {
  try {
    const { usuarioId, libroId } = req.body;
    const nuevoPrestamo = new Prestamo({
      usuario: usuarioId,
      libro: libroId,
    });
    await nuevoPrestamo.save();
    const prestamoPopulado = await Prestamo.findById(nuevoPrestamo._id)
      .populate('usuario', 'name username')
      .populate('libro', 'titulo autor');
    res.status(201).json(prestamoPopulado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.delete('/api/prestamos/:id', async (req, res) => {
  try {
    const prestamoEliminado = await Prestamo.findByIdAndDelete(req.params.id);
    if (!prestamoEliminado) {
      return res.status(404).json({ error: 'Préstamo no encontrado' });
    }
    res.json({ message: 'Préstamo eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});