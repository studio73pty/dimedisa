const handleHome = (req, res, db) => {
    db.select().table('productos')
    .then(response => {
        res.json(response);
    })

}

module.exports = {
    handleHome: handleHome
}