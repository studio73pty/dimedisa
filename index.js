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
const agregarProducto = require('./controllers/AgregarProducto');
const borrarProducto = require('./controllers/BorrarProducto');


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

//Agregar Producto
app.post('/agregar-producto', (req, res) => {agregarProducto.handleAgregarProducto(req, res, db)});

// Borrar Perfil
app.delete('/borrar-perfil/:id', (req, res) => {borrarProducto.handleBorrarProducto(req, res, db)});


const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`I'm alive here ${port}`))

