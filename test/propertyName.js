var mongoose = require('mongoose');
var expect = require('chai').expect;
var fs = require('fs');
var plugin = require('../lib/attachments');

var fakeProvider = function(){};
fakeProvider.prototype.getUrl = function(path){
  return path;
};
fakeProvider.prototype.createOrReplace = function(attachment, next){
  attachment.defaultUrl = this.getUrl(attachment.path);
  next(null, attachment);
};

plugin.registerStorageProvider('fakeProvider', fakeProvider);

UserSchema = new mongoose.Schema({ });
UserSchema.plugin(plugin, {
  directory: process.cwd() + '/users',
  storage: { providerName: 'fakeProvider', options: { } },
  properties: {
    profile: { styles: { original: { } } },
    avatar:  { styles: { original: { } } }
  }
});
var User = mongoose.model('User', UserSchema);

describe('path', function(){
  it('adds the propertyName in the attached image path', function(done){
    var user = new User({});
    var path = { path: process.cwd() + '/test/fixtures/mongodb.png' };
    user.attach('profile', path, function(err){
      expect(user.profile.original.defaultUrl).to.include('profile/' + user.id + '-original.png');
      user.attach('avatar', path, function(err){
        expect(user.avatar.original.defaultUrl).to.include('avatar/' + user.id + '-original.png');
        done();
      })
    })
  });
});
