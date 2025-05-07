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
    const { Articulo, Modelo, Color, FechaIngreso, CantidadActual, Ubicacion } = req.body;
    if (!Articulo || !Modelo || !Color || !FechaIngreso || CantidadActual || Ubicacion == null) {
      return res.status(400).json({ mensaje: 'Faltan campos requeridos' });
    }

    const nuevoProducto = new Producto({
      Articulo, Modelo, Color, FechaIngreso, CantidadActual, Ubicacion
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

