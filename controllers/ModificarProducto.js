const handleModificarProducto = (req, res, db) =>{
    const { id } = req.params;
     const { categoria, nombre, descripcion,
            disponibilidad, precio} = req.body;

               db('productos').where({ id: id }).update({     
                categoria,        
                nombre,
                descripcion,
                precio,
                disponibilidad
             }).then(res.status(200).json('producto actualizado'))
          
         
         }
 module.exports = {
     handleModificarProducto: handleModificarProducto
 }