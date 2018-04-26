var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const moment = require('moment');

var userSchema = new Schema({
  updated: {
    type: Date,
    default: () => {
      return moment().format('YYYY-MM-DD HH:mm:ss')
    }
  },
  account: String,
  suggestions: [{
    created: String,
    mobile: String,
    description: String
  }],
  transport:[{
    mobile: String,
    description: String,
    created: String,
    sType: Number,
    fromProvince: String,
    fromCity: String,
    toProvince: String,
    toCity: String,
    contact: String
  }]

}, {
  versionKey: false
});
//transport 物流信息 sType 0 找车 1 找货

var User = mongoose.model('User', userSchema);
module.exports = User;
