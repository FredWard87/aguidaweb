// testMongoConnection.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const mongoURI = process.env.MONGODB_URL;

mongoose.connect(mongoURI)
  .then(() => {
    console.log('MongoDB connected...');
    mongoose.connection.close();
  })
  .catch(err => {
    console.log('Error al conectar a MongoDB:', err);
  });
