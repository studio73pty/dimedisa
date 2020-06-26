const handleHome = (req, res, db) => {
    db.select().table('productos')
    .then(response => {
        res.json(response);
    })
.catch(err => res.status(500).json('problema con la base de datos + ' + err))
}

module.exports = {
    handleHome: handleHome
}