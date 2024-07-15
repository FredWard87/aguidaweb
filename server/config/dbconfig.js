const mongoose = require("mongoose");
const Usuarios = require('../models/usuarioSchema');

const MONGODB_URL = process.env.MONGODB_URL;

mongoose.connection.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
mongoose.connection.on('connected', async () => {
  console.log('Conexión exitosa a MongoDB');

  try {
    const user = await Usuarios.findOne({ Correo: 'ruben@gmail.com' });
    if (!user) {
      const rootUser = new Usuarios({
        Nombre: 'Ruben',
        FechaIngreso: new Date(),
        Correo: 'ruben@gmail.com',
        Contraseña: 'root321',
        Departamento: 'global',
        Puesto: 'Global',
        Escolaridad: 'Ingenieria en Alimentos',
        TipoUsuario: 'Administrador'
      });

      await rootUser.save();
      console.log("Usuario root creado");
    } else {
      console.log("Usuario root ya existe");
    }
  } catch (err) {
    console.error("Error al crear el usuario root:", err);
  }
});

(async () => {
  try {
    await mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err);
  }
})();

module.exports = mongoose;
