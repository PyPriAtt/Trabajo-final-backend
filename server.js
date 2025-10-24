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

const User = mongoose.model('User', userSchema);

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

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});