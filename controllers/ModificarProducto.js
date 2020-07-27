const handleModificarProducto = (req, res, db) =>{
    const { id } = req.params;
     const { 
        categoria, nombre, descripcion,
        disponibilidad, precio, modouso, codigo
        } = req.body;

               db('productos').where({ id: id }).update({     
                categoria,        
                nombre,
                descripcion,
                modouso,
                codigo,
                precio,
                disponibilidad
             }).then(res.status(200).json('producto actualizado'))
          
         
         }
 module.exports = {
     handleModificarProducto: handleModificarProducto
 }