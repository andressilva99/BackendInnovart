const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  IdProducto: Number,
  Articulo: String,
  Modelo: String,
  Color: String,
  FechaIngreso: String,
  CantidadActual: Number,
  Ubicacion: String
});

// Middleware para autoincrementar IdProducto
productoSchema.pre('save', async function (next) {
  if (this.isNew && !this.IdProducto) {
    const ultimoProducto = await mongoose
      .model('producto')
      .findOne()
      .sort({ IdProducto: -1 });

    this.IdProducto = ultimoProducto ? ultimoProducto.IdProducto + 1 : 1;
  }
  next();
});

const Producto = mongoose.model('producto', productoSchema, 'productos');
module.exports = Producto;
