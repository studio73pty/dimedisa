const handleModificarProducto = (req, res, db) =>{
    const { id } = req.params;
     const { 
        categoria, nombre, descripcion,
        disponibilidad, precio, modouso
        } = req.body;

               db('productos').where({ id: id }).update({     
                categoria,        
                nombre,
                descripcion,
                modouso,
                precio,
                disponibilidad
             }).then(res.status(200).json('producto actualizado'))
          
         
         }
 module.exports = {
     handleModificarProducto: handleModificarProducto
 }