const handleRegistro = (req, res, db, bcrypt) => {
    const { email, usuario, password } = req.body;
    const hash = bcrypt.hashSync(password);
    if(!email || !usuario || !password){
        return res.status(400).json('por favor llena todos los campos');
    }

    db.transaction(trx => {
        trx.insert({
            email: email,
            usuario: usuario,
            hash: hash
        })
        .into('registro')
        .then(res.status(200).json('usuario registrado exitosamente'))
    
    })
    .catch(err => res.status(400).json('no se pudo registrar'));
}


module.exports = {
    handleRegistro: handleRegistro
}
