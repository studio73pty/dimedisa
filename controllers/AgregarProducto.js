const handleAgregarProducto = (req, res, db) =>{
     const { categoria, nombre, descripcion,
              precio, disponibilidad, modouso } = req.body;
   
               db('productos').insert({
                categoria,             
                nombre,
                descripcion,
                precio,
                disponibilidad,
                modouso    
             }).then(res.status(200).json('producto agregado'))
          
             .catch(err => res.status(400).json('error agregando producto + ' + err))
         
         }
 module.exports = {
     handleAgregarProducto: handleAgregarProducto
 }