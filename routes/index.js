var express = require('express');
var router = express.Router();
var multer = require('multer')
var upload = multer({dest: 'public/images/'})
var sharp = require('sharp');
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.json({result: 'success'});
});

router.post('/upload', upload.single('file'), (req, res, next) => {
    sharp(path.join(__dirname, '..', '/' + req.file.path)).resize(60, 60).toFile(path.join(__dirname, '..', '/' + req.file.path + '-1')).then(data => {
        res.json({result: 'ok', fileName: req.file.filename});
    }).catch(err => {
        res.json({result: 'error'});
    })
})

module.exports = router;
