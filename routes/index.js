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

//提交物流信息
router.post('/submitTransport',function(req, res, next){
    var account = req.body.account;
    var mobile = req.body.mobile;
    var sType = req.body.sType;
    var description = req.body.description;
    var fromProvince = req.body.fromProvince;
    var fromCity = req.body.fromCity;
    var toProvince = req.body.toProvince;
    var toCity = req.body.toCity;
    var contact = req.body.contact;
    var userSvc = new UserSvc();
    if ( account == undefined )
     account = '';
    if ( mobile == undefined )
     mobile = '';

    userSvc.submitTransport(account, mobile,sType, description,fromProvince,fromCity,toProvince,toCity,contact).then(d => {
        res.json(new Result(Errors.Success));
    }).catch(err => {
        res.json(new Result(Errors.SystemFailed, err));
    });
})

//sType = 0 所有 1 车找货 2 货找车
router.get('/getTransport/:lineNum/:updated/:itemId/:action/:sType/:fromProvince/:fromCity/:toProvince/:toCity', function(req, res, next) {
  var lineNum = req.params.lineNum;
  var updated = req.params.updated;
  var itemId = req.params.itemId;
  var action = req.params.action;
  var sType = req.params.sType;
  var fromProvince = req.params.fromProvince;
  var fromCity = req.params.fromCity;
  var toProvince = req.params.toProvince;
  var toCity = req.params.toCity;
  if ( updated.length < 2 ) updated = '';

  if ( fromProvince == '0' )
    fromProvince = '';
  if ( fromCity == '0' )
    fromCity = '';
  if ( toProvince == '0' )
    toProvince = '';
  if ( toCity == '0' )
    toCity = '';
  var userSvc = new UserSvc();
  userSvc.getTransport(parseInt(lineNum), updated, itemId, action,parseInt(sType),fromProvince,fromCity,toProvince,toCity).then(data => {
    return res.json(new Result(Errors.Success, data));
  }).catch(err => {
    return res.json(new Result(Errors.FindItemFailed, err));
  });
});



module.exports = router;
