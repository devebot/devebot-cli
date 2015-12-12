'use strict';

var path = require('path');
var fs = require('fs');
var lodash = require('lodash');
var userhome = require('userhome');

var configSubdir = '.devebot';

function HomeConfig() {
  var self = this;

  var configDir = userhome(configSubdir);
  try {
    fs.readdirSync(configDir);
  } catch (err) {
    if (err.code == 'ENOENT') {
      fs.mkdirSync(configDir);
    }
  }
  
  var readConfigFile = function(configFile, defaultConfig) {
    var configData = defaultConfig;
    try {
      configData = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    } catch (err) {
      if (err.code == 'ENOENT') {
        fs.writeFileSync(configFile, JSON.stringify(configData, null, 2), 'utf8');
      }
    }
    return configData;
  };
  
  var configObj = readConfigFile(path.join(configDir, 'config.json'), {
    host: '0.0.0.0',
    port: 17779,
    path: '/devebot'
  });
  
  self.getConfig = function() {
    var context = process.env.NODE_DEVEBOT_CLI;
    if (lodash.isString(context) && !lodash.isEmpty(context)) {
      self.loadConfig(context);
    }
    return lodash.clone(configObj, true);
  };
  
  self.loadConfig = function(context) {
    if (!lodash.isString(context)) return;
    var customCfg = readConfigFile(path.join(configDir, 'config.' + context + '.json'), {});
    configObj = lodash.defaultsDeep(customCfg, configObj);
  };
  
  self.saveConfig = function(context, customCfg) {
    if (!lodash.isString(context)) return;
    var customFile = path.join(configDir, 'config.' + context + '.json');
    
    if (!lodash.isObject(customCfg)) return;
    configObj = lodash.defaultsDeep(customCfg, configObj);
    
    fs.writeFileSync(customFile, JSON.stringify(configObj, null, 2), 'utf8');
  };
}

module.exports = new HomeConfig();
