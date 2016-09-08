'use strict';
var WxBase = require('co-wxbase');
var debug = require('debug')('co-wxasset');
var request = require('request');
var fs = require('fs');

class AssetsApi extends WxBase {
  constructor(config) {
    super(config);
  }

  *upload(uri, type, accessToken){
    if (!accessToken) accessToken = yield this.provider.getAccessToken();
    var stream;
    if ( uri.startsWith('http://') || uri.startsWith('https://') ) {
      stream = request.get(uri);
    }
    else {
      stream = fs.createReadStream(uri);
    }
    var url = `http://file.api.weixin.qq.com/cgi-bin/media/upload?access_token=${accessToken}&type=${type}`;
    var result = yield this.rawRequest(url, 'POST', null, {formData: {media: stream}});
    return result;
  }

  *download(mediaId, accessToken){
    if (!accessToken) accessToken = yield this.provider.getAccessToken();
    var url = `http://file.api.weixin.qq.com/cgi-bin/media/get?access_token=${accessToken}&media_id=${mediaId}`;
    var data = yield this.rawRequest(url, 'GET', null, {encoding: null, withHeaders: true});
    return data;
  }

  *count(access_token){
    var accessToken = access_token;
    if (!accessToken) accessToken = yield this.provider.getAccessToken();
    var url = `https://api.weixin.qq.com/cgi-bin/material/get_materialcount?access_token=${accessToken}`;
    var result = yield this.jsonRequest(url, 'GET');
    return result;
  }

  *list(type, offset, count, access_token) {
    var accessToken = access_token;
    if (!accessToken) accessToken = yield this.provider.getAccessToken();
    var params = {
      type: type,
      offset: parseInt(offset)?offset:0,
      count: parseInt(count)?count:20
    }
    var url = `https://api.weixin.qq.com/cgi-bin/material/batchget_material?access_token=${accessToken}`;
    var result = yield this.jsonRequest(url, 'POST', params);
    return result;
  }

  *getAccessToken(){
    var token = yield this.jsonRequest(this.apis.getAccessToken, 'GET');
    return token;
  }

  *getServerIps(access_token){
    var accessToken = access_token;
    if (!accessToken) accessToken = yield this.provider.getAccessToken();
    var url = `https://api.weixin.qq.com/cgi-bin/getcallbackip?access_token=${access_token}`
    var result = yield this.jsonRequest(url, 'GET');
    return result;
  }
}

module.exports = function createAssetApi(config){
  var api = new AssetsApi(config);
  return api;
}
