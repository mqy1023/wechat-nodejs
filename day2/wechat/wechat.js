'use strict'

var Promise = require('bluebird');
var request = Promise.promisify(require('request')); // request promise化

var prefix = 'https://api.weixin.qq.com/cgi-bin/';
var api = { // 看'开发' -> '接口权限' -> 点击相应接口
  accessToken: prefix + 'token?grant_type=client_credential',
}

function Wechat(opts) { // access_token票据相关
  var that = this;
  this.appID = opts.appID;
  this.appSecret = opts.appSecret;
  this.getAccessToken = opts.getAccessToken;
  this.saveAccessToken = opts.saveAccessToken;

  this.getAccessToken().then(function(data) {

    try {
      data = JSON.parse(data);
      console.log('init data', data)
    } catch (e) {
      console.log('updateAccessToken data', data)
      return that.updateAccessToken();
    }
    if (that.isValidAccessToken(data)) {
      console.log('isValidAccessToken')
      // Promise.resolve(data);
      return data;
    } else {
      return that.updateAccessToken(); // 更新access_token
    }
  }).then(function(data) {
    console.log('3333data', data)
    that.access_token = data.access_token;
    that.expires_in = data.expires_in;

    that.saveAccessToken(data);
  })
}
Wechat.prototype.isValidAccessToken = function(data) {
  if (!data || !data.access_token || !data.expires_in) {
    return false;
  }
  var access_token = data.access_token;
  var expires_in = data.expires_in;
  var now = (new Date().getTime());
  if (now < expires_in) {
    return true;
  } else {
    return false;
  }
}

Wechat.prototype.updateAccessToken = function() {
  var appID = this.appID;
  var appSecret = this.appSecret;
  var url = api.accessToken + '&appid='+ appID + '&secret=' + appSecret;

  // console.log('url==', url);
  return new Promise(function(resolve, reject) {
    request({ url: url, json: true }).then(function(response) {
      // console.log('response==', response);
      // var data = response[1];
      var data = response['body'];
      // console.log('data==', data);
      var now = (new Date().getTime());
      var expires_in = now + (data.expires_in - 20) * 1000;

      data.expires_in = expires_in;
      resolve(data);
    });
  });
}

module.exports = Wechat;
