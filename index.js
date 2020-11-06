const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');
const fs = require('fs');
require('dotenv').config();
const knex = require('knex');
const bcrypt = require('bcrypt-nodejs');
const paypal = require('paypal-rest-sdk');



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

paypal.configure({
  'mode': 'sandbox',
  'client_id': process.env.CLIENT_ID,
  'client_secret': process.env.CLIENT_SECRET
})

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



//  Endpoints de paypal
let total = 0;

app.post('/pay', async (req, res) =>{
    const reqQuery = { ...req.query };
   
   let queryProd = reqQuery.id.split(',');
   let queryCant = reqQuery.cantidad.split(',');
   
   let productosArr = [];
   let cantidadArr = [];

  

   // Buscando los productos por ID en los parametros y colocandolos en un arreglo


   for(let i = 0; i < queryProd.length; i++){
     let producto = await db('productos').select().where({ id: queryProd[i] });
     productosArr.push(producto);
   }
   // Colocando en un arreglo la cantidad de cada producto
   for(let i = 0; i < queryCant.length; i++){
     cantidadArr.push(parseInt(queryCant[i],10));
   }
   
   // Comprobando si hay la cantidad suficiente de productos disponibles
   for(let i = 0; i < productosArr.length; i++){
     if(productosArr[i][0].disponibilidad < cantidadArr[i]){
       return res.json
       (`no hay suficientes productos de ${productosArr[i][0].nombre}: ${productosArr[i][0].disponibilidad} y se han pedido: ${cantidadArr[i]}` 
       )
     }
   }

   // Calculando el monto total
   for(let i = 0; i < productosArr.length; i++){
     let precio = productosArr[i][0].precio
     let cantidad = parseInt(cantidadArr[i], 10);

     total = total + (precio * cantidad);

   }
   total = Math.round(total * 100) / 100;

  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:3000/success",
        "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": []
        },
        "amount": {
            "currency": "USD",
            "total": "0"
        },
        "description": "Iphone X prueba cliente"
    }]
};

//  Agregando los productos con sus cantidades a create_payment_json
  for(let i = 0; i < productosArr.length; i++){
    let obj = new Object();
    obj.name = productosArr[i][0].nombre;
    obj.sku = productosArr[i][0].id;
    obj.price = productosArr[i][0].precio;
    obj.quantity = cantidadArr[i];
    obj.currency = "USD";
    create_payment_json.transactions[0].item_list.items.push(obj)
  }

  create_payment_json.transactions[0].amount.total = total;


paypal.payment.create(create_payment_json, function (error, payment) {
  if (error) {
      throw error;
  } else {
      for(let i = 0; i < payment.links.length; i++){
          if(payment.links[i].rel == 'approval_url'){
              res.send(payment.links[i].href)
          }
      }
  }
});

})

app.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": "0"
          }
      }]
    };

    execute_payment_json.transactions[0].amount.total = total;

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log(error.response.details);
          throw error;
      } else {
        res.json({
          success: true,
          data: payment
        })
      }
  });
  });

app.get('/cancel', (req, res) => {
  res.status(200).json('cancelado')
});


const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`I'm alive here ${port}`))

