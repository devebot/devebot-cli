'use strict';

var lodash = require('lodash');
var util = require('util');

var clientInfo = require('./appinfo.js');

function TextUI(params) {
  params = params || {};

  this.displayCliHeader = function(clidef) {
    clidef = clidef || {};
    var serverInfo = clidef.appinfo;
    console.log('%s: %s (v%s)', clientInfo.name, clientInfo.description, clientInfo.version);
    if (lodash.isObject(serverInfo)) {
      console.log('%s: %s (v%s)', serverInfo.name, serverInfo.description, serverInfo.version);
    }
  };
  
  this.displayCliFooter = function(clidef) {
    var cfgObj = params.config;
    var mpfObj = params.myperf;
    
    var status = [];
    
    if (lodash.isObject(cfgObj)) {
      var ctx = cfgObj.getContext();
      status.push(lodash.isEmpty(ctx) ? 'default' : ctx);
      var cfg = cfgObj.getConfig();
      if (lodash.isObject(cfg)) {
        status.push(util.format(' - %s://%s:%s%s', 
          cfg.protocol || 'http', cfg.host, cfg.port, cfg.path));
      }
    }
    
    if (lodash.isObject(mpfObj)) {
      var usage = mpfObj.stop();
      status.push(util.format(' - Time: %s - Memory: %s', usage.time_text, usage.memory_text));
    }
    
    [
      "",
      "------------------------------------------------------------------------------------",
      status.join(''),
      "",
    ].forEach(function(str) { console.log(str); });
  };
  
  this.displayException = function(exception) {
    [
      "",
      "" + JSON.stringify(exception, null, 2),
      "------------------------------------------------------------------------------------",
      "For more information about using this application, please see the guide:",
      "" + clientInfo.homepage,
      "",
    ].forEach(function(str) { console.log(str); });
  };

  this.displayResult = function(result) {
    console.log('');
    process.stdout.write(util.format('Command result: %s\n', JSON.stringify(result, null, 2)));
  };
  
  this.displayError = function(error) {
    console.log('');
    if (lodash.isObject(error)) {
      if (error.name == 'restapi_request_error' || error.name == 'restapi_invalid_status') {
        [
          "Fatal error: Unable to find devebot service.",
          "",
          "If you're seeing this message, either the devebot service hasn't been installed,",
          "or it is running incorrectly.",
        ].forEach(function(str) { process.stderr.write(util.format('%s\n', str)); });
      } else {
        process.stderr.write(util.format('Command error: %s\n', JSON.stringify(error, null, 2)));
      }
    } else {
      process.stderr.write(util.format('Unknown error: %s\n', error));
    }
  };
}

module.exports = TextUI;
