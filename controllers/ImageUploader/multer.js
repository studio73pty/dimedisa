const multer = require('multer');

// specify the storage engine

const storage = multer.diskStorage ({
    destination: function (req,file,cb) {
        cb(null, './uploads/')
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + '-' + file.originalname)
    }
})

// file Validation

const   fileFilter = (req, file, cb) => {
    if (!file.mimetype.match(/jpe|jpeg|png|gif$i/)) {
      cb(new Error('Este tipo de archivo no es permitido, solo .JPG y .PNG'), false)
      return
    }

    cb(null, true)
  }

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 },
    fileFilter: fileFilter
});

module.exports = upload;