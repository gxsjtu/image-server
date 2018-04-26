const Promise = require('promise');
const User = require('../models/user');
const Errors = require('../services/errors');
const moment = require('moment');
const _ = require('lodash');

var UserSvc = function UserSvc() {

}

UserSvc.prototype.trim = function(str)
{
  return str.replace(/(^\s*)|(\s*$)/g, "");
}

UserSvc.prototype.submitSuggestion = function(account, mobile, description) {
  return new Promise((resolve, reject) => {
    account = this.trim(account);
    if ( account == '' )
     account = "anonymous";

    mobile = this.trim(mobile);
    if ( mobile=='' || (description.length < 3) )
      return reject(err);
    else
    {
    User.findOneAndUpdate({
        account: account
      }, {
        updated:moment().format('YYYY-MM-DD HH:mm:ss'),
        description: description,
        '$push': {
          'suggestions': {
            created:moment().format('YYYY-MM-DD HH:mm:ss'),
            mobile:mobile,
            description:description
          }
        }
      }, {
        new: false,
        upsert: true
      }).then((d) => {
        return resolve(1);
      }).catch(err => {
        return reject(err);
      });
    }
  });
};

//提交车找货  货找车信息
UserSvc.prototype.submitTransport = function(account, mobile,sType, description,fromProvince,fromCity,toProvince,toCity,contact) {
  return new Promise((resolve, reject) => {
    account = this.trim(account);
    if ( account == '' )
     return reject();

    mobile = this.trim(mobile);
    if ( mobile=='' )
      return reject();
    else
    {
    User.findOneAndUpdate({
        account: account
      }, {
        updated:moment().format('YYYY-MM-DD HH:mm:ss'),
        description: description,
        '$push': {
          'transport': {
            created:moment().format('YYYY-MM-DD HH:mm:ss'),
            mobile:mobile,
            description:description,
            sType:sType,
            fromProvince:fromProvince,
            fromCity: fromCity,
            toProvince: toProvince,
            toCity:toCity,
            contact:contact
          }
        }
      }, {
        new: false,
        upsert: true
      }).then((d) => {
        return resolve(1);
      }).catch(err => {
        return reject(err);
      });
    }
  });
};


UserSvc.prototype.getTransport = function(lineNum,updated,itemId,action,sType,fromProvince,fromCity,toProvince,toCity) {
  return new Promise((resolve, reject) => {

    var upward = 0;
    if ( lineNum > 100 || lineNum <= 0 ) lineNum = 50;
    if ( action === 'UP' )
      upward = 1;

    var retNum = lineNum;
    lineNum+=20;
    var option = {};
    var optionFind = {};
    var condition = {};
    var ret = [];

    if ( fromProvince!='' )
    {
     condition.fromProvince = fromProvince;
     optionFind['transport.fromProvince'] = fromProvince;
    }
    if ( fromCity!='' )
    {
     condition.fromCity = fromCity;
     optionFind['transport.fromCity'] = fromCity;
    }
    if ( toProvince!='' )
    {
     condition.toProvince = toProvince;
     optionFind['transport.toProvince'] = toProvince;
    }
    if ( toCity!='' )
    {
     condition.toCity = toCity;
     optionFind['transport.toCity'] = toCity;
    }

    condition.sType = sType;

    optionFind['transport.sType'] = sType;

    var findok = 0;
    if (updated != "") {
      if (upward === 1)
      {
      condition.created = {
        $lte: updated
      };
      optionFind['transport.created'] = {$lte: updated};
      }
      else {
        condition.created = {
          $gte: updated
        };
        optionFind['transport.created'] = {$gte: updated};
        findok = 1;
      }
    } else {
       findok = 1;

    }

    option.transport = {$elemMatch:condition
    };

    User.aggregate([
      {
        $match: option
      },
      {
        $project: {
          _id: 1,
          transport: 1
        }
      },
      {
        $unwind : "$transport"
      },
      {
        $match: optionFind
      },
      {
        $sort: {
          'transport.created': -1
        }
      },
      {$limit: lineNum }
    ]).then((docs) => {
      var itemNum = 0;
      var j = 0;
      j = 0;
      var k=0;
      var doc_Len = docs.length;
      if ( itemId.length > 3 )
      {
        if (upward === 1) {
          for (j = 0; j < docs.length; j++)
          if (docs[j].transport._id.toString() === itemId) {
            findok = 1;
            k = j+1;
            break;
          }
        }
        else
          for (j = docs.length-1; j >=0 ; j--) {
          if (docs[j].transport._id.toString() === itemId) {
            findok = 1;
            k = 0;
            doc_Len = j;
            break;
          }
          }
      }
      else
        findok = 1;

      var id = "";
      for (j = k; j < doc_Len; j++) {
        if (findok === 1) {
          id = docs[j].transport._id.toString();
          ret.push({
            id: id,
            mobile: docs[j].transport.mobile,
            description: docs[j].transport.description,
            created: docs[j].transport.created,
            sType: docs[j].transport.sType,
            fromProvince: docs[j].transport.fromProvince,
            fromCity: docs[j].transport.fromCity,
            toProvince: docs[j].transport.toProvince,
            toCity: docs[j].transport.toCity,
            contact: docs[j].transport.contact,
            no: itemNum
          });
          itemNum++;
          if (itemNum > retNum) break;
        }
      }
      ret = _.orderBy(ret, ["no"], ["asc"]);
      return resolve(ret);

    }).catch(err1 => {
      return reject(err1);
    });
  });
};


module.exports = UserSvc;
