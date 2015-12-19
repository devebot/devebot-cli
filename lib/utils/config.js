'use strict';

var fs = require('fs');
var path = require('path');
var lodash = require('lodash');
var userhome = require('userhome');

function HomeConfig(params) {
  params = params || {};

  var environmentVar = params.environmentVar || 'NODE_DEVEBOT_CLI';
  var configContext = process.env[environmentVar];
  var configSubdir = params.configSubdir || '.devebot';
  var configFilename = params.configFilename || 'config';
  var defaultConfig = params.defaultConfig || {
    host: '0.0.0.0',
    port: 17779,
    path: '/devebot'
  };
  
  var self = this;

  var configDir = userhome(configSubdir);
  try {
    fs.readdirSync(configDir);
  } catch (err) {
    if (err.code == 'ENOENT') {
      fs.mkdirSync(configDir);
    }
  }
  
  var readConfigFile = function(defaultConfig, configDir, context) {
    var configData = defaultConfig;
    
    var filenameParts = [configFilename];
    if (lodash.isString(context) && context.length > 0) {
      filenameParts.push('.', context);
    }
    filenameParts.push('.json');
    var configFile = path.join(configDir, filenameParts.join(''));
    
    try {
      configData = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    } catch (err) {
      if (err.code == 'ENOENT') {
        fs.writeFileSync(configFile, JSON.stringify(configData, null, 2), 'utf8');
      }
    }
    return configData;
  };
  
  var configObj = readConfigFile(defaultConfig, configDir);
  
  self.getConfig = function() {
    if (lodash.isString(configContext) && !lodash.isEmpty(configContext)) {
      self.loadConfig(configContext);
    }
    return lodash.clone(configObj, true);
  };
  
  self.loadConfig = function(context) {
    if (!lodash.isString(context)) return;
    configObj = lodash.defaultsDeep(readConfigFile({}, configDir, context), configObj);
  };
  
  self.saveConfig = function(context, customCfg) {
    if (!lodash.isString(context) || context.length == 0) return;
    var customFile = path.join(configDir, 'config.' + context + '.json');
    
    if (!lodash.isObject(customCfg)) return;
    configObj = lodash.defaultsDeep(customCfg, configObj);
    
    fs.writeFileSync(customFile, JSON.stringify(configObj, null, 2), 'utf8');
  };
}

module.exports = HomeConfig;
