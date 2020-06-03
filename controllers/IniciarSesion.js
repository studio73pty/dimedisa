const handleInicioSesion = (req, res, db, bcrypt) =>{
    const {usuario, password} = req.body;
    if(!usuario || !password){
        return res.status(400).json('por favor completa los campos');
    }
    db.select('usuario', 'hash').from('registro')
    .where('usuario', '=', usuario )
    .then(data => {
        const isValid = bcrypt.compareSync(password, data[0].hash);
        if(isValid) {
            return db.select('*').from('registro')
            .where('usuario', '=', usuario)
            .then(res.json('acceso garantizado'))
            /*.then(user => {
                res.json(user[0])
            })*/
            .catch(err => res.status(400).json('unable to get user'))
        } else {
            res.status(400).json('credenciales incorrectas')
        }
    })
    .catch(err => res.status(400).json('problemas con la base de datos'))
    }

module.exports = {
    handleInicioSesion: handleInicioSesion
}