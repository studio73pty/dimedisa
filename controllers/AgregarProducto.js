const handleAgregarProducto = (req, res, db) =>{
     const { categoria, nombre, descripcion,
              precio, disponibilidad, imagen } = req.body;
   
               db('productos').insert({
                categoria,             
                nombre,
                descripcion,
                precio,
                disponibilidad,
                imagen,    
             }).then(res.status(200).json('producto agregado'))
          
         
         
         }
 module.exports = {
     handleAgregarProducto: handleAgregarProducto
 }