const Promise = require('promise');
const User = require('../models/user');
const Errors = require('../services/errors');
const moment = require('moment');

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
UserSvc.prototype.submitTransport = function(account, mobile,province,city,address,sType, description) {
  return new Promise((resolve, reject) => {
    account = this.trim(account);
    if ( account == '' )
     return reject();

    mobile = this.trim(mobile);
    if ( mobile=='' || (description.length < 2) )
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
            province:province,
            city:city,
            address:address,
            description:description,
            sType:sType
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


module.exports = UserSvc;
