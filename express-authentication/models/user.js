var mongoose = require('mongoose');
var md5 = require('md5');

// ***** NOTE: current current password uses MD5 ******
// var bcrypt   = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    local: {
        name: String,
        email: String,
        password: String
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String
    }
});

userSchema.methods.generateHash = function(password) {
    return md5(password);
};
userSchema.methods.validPassword = function(password) {
    return this.local.password === md5(password);
};
module.exports = mongoose.model('User', userSchema);  