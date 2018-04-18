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
  }]
}, {
  versionKey: false
});

var User = mongoose.model('User', userSchema);
module.exports = User;
