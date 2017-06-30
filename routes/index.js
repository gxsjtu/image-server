var express = require('express');
var router = express.Router();
var multer = require('multer')
var upload = multer({
  dest: 'public/images/'
})
var sharp = require('sharp');
var path = require('path');
const fs = require('fs');
const _ = require('lodash');
const junk = require('junk');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({
    result: 'success'
  });
});

router.post('/upload', upload.single('file'), (req, res, next) => {
  sharp(path.join(__dirname, '..', '/' + req.file.path)).resize(60, 60).toFile(path.join(__dirname, '..', '/' + req.file.path + '-1')).then(data => {
    res.json({
      result: 'ok',
      fileName: req.file.filename
    });
  }).catch(err => {
    res.json({
      result: 'error'
    });
  })
})

router.get('/getADImage', function(req, res, next) {
  var path = __dirname + '/..' + '/public/ads';
  fs.readdir(path, (err, files) => {
    if (err) {
      res.json({
        result: 'error'
      });
    } else {
      var maxName = 0; //记录最大图片的名字
      // var imgFileName;//防止图片后缀不同 所以存储起来
      _.forEach(files.filter(junk.not), x => {
        // var index = x.lastIndexOf('.');
        var imgName = parseInt(x);
        if (imgName > maxName) {
          maxName = imgName;
          // imgFileName = x;
        }
      })
      var imgBuf = fs.readFileSync(__dirname + '/..' + '/public/ads/' + maxName);
      var imgBase = imgBuf.toString("base64");
      res.json({
        result: 'ok',
        imgData: imgBase
      });
      // res.json({result: 'ok', imgName: imgFileName});
    }
  })
})

module.exports = router;
