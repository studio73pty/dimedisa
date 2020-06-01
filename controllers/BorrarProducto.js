const handleBorrarProducto = (req, res, db) => {
    const { id } = req.params;
    db('productos').where({ id: id})
    .del()
    .then(res.json('borrado exitoso!'))
}


module.exports = {
    handleBorrarProducto: handleBorrarProducto
}