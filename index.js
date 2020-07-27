const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');
const fs = require('fs');
require('dotenv').config();
const knex = require('knex');
const bcrypt = require('bcrypt-nodejs');



// LLamando a los controladores
const home = require('./controllers/Home');
const borrarProducto = require('./controllers/BorrarProducto');
const modificarProducto = require('./controllers/ModificarProducto');
const agregarProducto = require('./controllers/AgregarProducto');
const registro = require('./controllers/Registro');
const inicioSesion = require('./controllers/IniciarSesion');
const buscarProducto = require('./controllers/BuscarProducto');
const buscarCategoria = require('./controllers/BuscarCategoria');
 
 
// Llamando a Uploads y Cloudinary
const upload = require('./controllers/ImageUploader/multer');
const cloudinary = require('./controllers/ImageUploader/Cloudinary');

// Creando conexion a la base de datos
const db = knex({
    client: 'mysql',
    connection: {
      host : process.env.DB_HOST,
      user : process.env.DB_USER,
      password : process.env.DB_PASSWORD,
      port: 3306,
      database: process.env.DATABASE
    }
  });

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

  
//Inicio de endpoints

app.get('/', (req, res) => {res.json('estoy vivo!')});

//Obtener todos los productos
app.get('/home', (req, res) => { home.handleHome(req, res, db) });

//Buscar producto
app.get('/buscar-producto/:id', (req, res) => {buscarProducto.handleBuscarProducto(req, res, db)});

//Buscar productos por categoria
app.post('/buscar-productos-categoria', (req, res) => {buscarCategoria.handleBuscarCategoria(req, res, db)})

//Registro
app.post('/registro', (req, res) =>  { registro.handleRegistro(req, res, db, bcrypt) });

//Iniciar Sesion
app.post('/iniciar-sesion', (req, res) =>  { inicioSesion.handleInicioSesion(req, res, db, bcrypt) });

//Agregar Producto
//app.post('/agregar-producto', (req, res) => { agregarProducto.handleAgregarProducto(req, res, db) });


app.use('/agregar-producto', upload.array('image'), async(req, res) => {
  const uploader = async (path) => await cloudinary.uploads(path, 'Dimedisa');
  let safeUrl = '';
  const insert = (str, index, value) => {
    safeUrl = str.substr(0, index) + value + str.substr(index);
}

  const { 
    categoria, nombre, descripcion,
    precio, disponibilidad, modouso, codigo 
      } = req.body;

  if (req.method === 'POST') {
      const urls = [];
      const files = req.files;

      for(const file of files) {
          const { path } = file;

          const newPath = await uploader(path);

          urls.push(newPath);

          fs.unlinkSync(path);
      
          };

          const unsafeUrl = urls[0].url;
          insert(unsafeUrl, 4, 's');

             db('productos').insert({
              categoria,             
              nombre,
              descripcion,
              precio,
              codigo,
              disponibilidad,
              modouso,    
              imagen: safeUrl   
           }).then(res.status(200).json('producto agregado'))
             // id: urls[0].id
        } else {
      res.status(405).json({
          err: "No se pudo subir la imagen"
      })
  }
})


// Borrar Perfil
app.delete('/borrar-producto/:id', (req, res) => {borrarProducto.handleBorrarProducto(req, res, db)});

//Modificar Perfil
app.patch('/modificar-producto/:id', (req, res) => {modificarProducto.handleModificarProducto(req, res, db)});


// Imagen de producto
app.use('/imagen-producto/:id', upload.array('image'), async(req, res) => {
  const uploader = async (path) => await cloudinary.uploads(path, 'Dimedisa');
  let safeUrl = '';
  const insert = (str, index, value) => {
    safeUrl = str.substr(0, index) + value + str.substr(index);
}
  const { id } = req.params;
  if (req.method === 'PATCH') {
      const urls = [];
      const files = req.files;

      for(const file of files) {
          const { path } = file;

          const newPath = await uploader(path);

          urls.push(newPath);

          fs.unlinkSync(path);
      
          };
          const unsafeUrl = urls[0].url;
          insert(unsafeUrl, 4, 's');

            db('productos').where({id: id}).update({             
              imagen: safeUrl
             // id: urls[0].id

          })
             .then(console.log)           
          
      res.status(200).json('exito');
  } else {
      res.status(405).json({
          err: "No se pudo subir la imagen"
      })
  }
  
})

//Borrar Imagen de producto




const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`I'm alive here ${port}`))

