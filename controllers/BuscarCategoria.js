const handleBuscarCategoria = (req, res, db) => {
    const { categoria } = req.body;
    db.select('*').from('productos').where({
        categoria : categoria
    }).then(user => {
        if(user.length){
            res.json(user)
        }else{
            res.status(400).json('productos no encontrados')
        }
    })
    .catch(err => res.status(400).json('error buscando productos'))

}

module.exports = {
    handleBuscarCategoria
}