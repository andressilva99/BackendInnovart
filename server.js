require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Usuario = require('./models/usuario'); 
const Producto = require('./models/productos');
const Role = require('./models/Role');

const app = express();

app.use(express.json());
app.use(cors());

// ========== CONEXIÓN A MONGODB ATLAS ==========
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: { version: '1', strict: true, deprecationErrors: true }
})
.then(() => console.log('✅ Conectado a MongoDB Atlas'))
.catch(err => console.error('❌ Error al conectar a MongoDB Atlas:', err));

// ========== RUTAS DE USUARIO ==========
app.post('/register', async (req, res) => {
  try {
    const { nombreUsuario, email, contraseña } = req.body;
    if (!nombreUsuario || !email || !contraseña) {
      return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
    }

    const idRol = `ROL-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const nuevoUsuario = new Usuario({
      Nombre: nombreUsuario,
      Email: email,
      Contraseña: contraseña,
      IdRol: idRol,
    });

    await nuevoUsuario.save();
    res.json({ mensaje: 'Usuario registrado con éxito', usuario: nuevoUsuario.toObject() });

  } catch (error) {
    console.error('❌ Error al registrar usuario:', error);
    res.status(500).json({ mensaje: 'Error interno', error });
  }
});

// ========== RUTAS DE PRODUCTO ==========
app.get('/productos', async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener productos', error });
  }
});

app.post('/productos', async (req, res) => {
  try {
    const { Articulo, Modelo, Color, FechaIngreso, CantidadActual } = req.body;
    if (!Articulo || !Modelo || !Color || !FechaIngreso || CantidadActual == null) {
      return res.status(400).json({ mensaje: 'Faltan campos requeridos' });
    }

    const nuevoProducto = new Producto({
      Articulo, Modelo, Color, FechaIngreso, CantidadActual
    });

    await nuevoProducto.save();
    res.status(201).json({ mensaje: 'Producto agregado', producto: nuevoProducto });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al agregar producto', error });
  }
});

app.put('/productos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const actualizado = await Producto.findOneAndUpdate(
      { IdProducto: id },
      req.body,
      { new: true }
    );

    if (!actualizado) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    res.json({ mensaje: 'Producto actualizado', producto: actualizado });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar producto', error });
  }
});

app.delete('/productos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await Producto.deleteOne({ IdProducto: id });
    res.json({ mensaje: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar producto', error });
  }
});

// ========== RUTAS DE ROLES ==========
app.get('/roles', async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener roles', error });
  }
});

app.post('/roles', async (req, res) => {
  try {
    const { Nombre, Edit, Add, Delete, View } = req.body;
    if (!Nombre) return res.status(400).json({ mensaje: 'Nombre es obligatorio' });

    const nuevoRole = new Role({ Nombre, Edit, Add, Delete, View });
    await nuevoRole.save();
    res.status(201).json({ mensaje: 'Rol agregado', rol: nuevoRole });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al agregar rol', error });
  }
});

app.put('/roles/:id', async (req, res) => {
  try {
    const actualizado = await Role.findOneAndUpdate(
      { IdRole: parseInt(req.params.id) },
      req.body,
      { new: true }
    );

    if (!actualizado) {
      return res.status(404).json({ mensaje: 'Rol no encontrado' });
    }

    res.json({ mensaje: 'Rol actualizado', rol: actualizado });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar rol', error });
  }
});

app.delete('/roles/:id', async (req, res) => {
  try {
    await Role.deleteOne({ IdRole: parseInt(req.params.id) });
    res.json({ mensaje: 'Rol eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar rol', error });
  }
});

app.listen(3000, () => console.log('🚀 Servidor corriendo en http://localhost:3000'));
