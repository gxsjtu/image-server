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

var Errors = require('../services/errors');
const UserSvc = require('../services/userSvc.js');
var Result = require('../services/Result');

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

router.get('/getADImage/:imgName',function(req, res, next){
  var oldName = req.params.imgName;
  var nameList = [];
  var path = __dirname + '/..' + '/public/ads';
  fs.readdir(path, (err, files) => {
    if (err) {
      res.json({
        result: 'error'
      });
    } else {
      // var maxName = 0;//记录最大图片的名字
      _.forEach(files.filter(junk.not), x => {
        let imgName = parseInt(x);
        if(imgName > oldName){
          nameList.push(imgName);
        }
      })

      var methodList = [];
      if(nameList.length > 0){
        // res.json({result: 'ok', imgNames: nameList});
        _.forEach(nameList, (name) => {
          methodList.push(getImgRes(name));
        })
        Promise.all(methodList).then(datas => {
          var resData = _.sortBy(datas, (d) => {
            return d.imgName;
          })
          res.json({result: 'ok', imgDatas: resData});
        }).catch(err => {
          res.json({result: "error"});
        })
      }else{
        res.json({result: 'no'});
      }
    }
  })
})

function getImgRes(name){
  return new Promise((resolve, reject) => {
    fs.readFile(__dirname + '/..' + '/public/ads/' + name, (err, data) => {
      if(err) {
          reject(err);
      }else{
        var imgBase = data.toString("base64");
        resolve({imgData: imgBase, imgName: name});
      }
    });
  })
}

router.post('/submitSuggestion',function(req, res, next){
    var account = req.body.account;
    var mobile = req.body.mobile;
    var description = req.body.description;
    var userSvc = new UserSvc();
    userSvc.submitSuggestion(account, mobile, description).then(d => {
        res.json(new Result(Errors.Success));
    }).catch(err => {
        res.json(new Result(Errors.SystemFailed, err));
    });
})

module.exports = router;
