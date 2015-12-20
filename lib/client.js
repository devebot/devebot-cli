'use strict';

var Promise = require('bluebird');
var lodash = require('lodash');
var util = require('util');
var program = require('commander');

var DevebotApi = require('devebot-api');

var Config = require('../lib/utils/config.js');
var logger = require('../lib/utils/logger.js');
var TextUI = require('../lib/utils/textui.js');
var Myperf = require('../lib/utils/myperf.js');

module.exports = function(params) {
  params = params || {};

  var cfgObj = new Config(params);
  var mpfObj = new Myperf();
  var tui = new TextUI({ config: cfgObj, myperf: mpfObj });
  
  var cfg = cfgObj.getConfig();
  var devebot = new DevebotApi(lodash.extend(cfg, {
    logger: logger
  }));
  
  devebot.on('started', function() {
    logger.debug(' The command is started');
  });
  
  devebot.on('success', function(data) {
    tui.displayResult(data.value || data.result);
  });
  
  devebot.on('failure', function(data) {
    tui.displayError(data.error);
  });
  
  devebot.on('done', function() {
    logger.debug(' - The command is done');
  });
  
  devebot.on('noop', function() {
    logger.debug(' - The command not found');
  });
  
  var init = Promise.promisify(devebot.loadDefinition);
  init().then(function(clidef) {
    tui.displayCliHeader(clidef);
    return run(devebot, clidef).then(function() {
      tui.displayCliFooter(clidef);
    });
  }).catch(function(exception) {
    tui.displayException(exception);
  });
};

var run = function(devebot, clidef) {
  return Promise.promisify(function(callback) {
    clidef = clidef || {};
    logger.trace(' * cli definition: %s', JSON.stringify(clidef, null, 2));
  
    var commands = clidef.commands || [];
  
    for(var i=0; i<commands.length; i++) {
      var command = commands[i];
      
      var cmddef = program.command(command.name).description(command.description);
      
      var options = command.options || [];
      for(var k=0; k<options.length; k++) {
        var option = options[k];
        cmddef = cmddef.option(util.format('-%s --%s %s', 
            option.abbr, option.name, option.required?'<value>':'[value]'), 
            option.description);
      }
      
      var optionNames = lodash.map(options, function(option) {
        return option.name;
      });
      
      cmddef = cmddef.action((function(command, optionNames) {
        return function(values) {
          devebot.execCommand({
            name: command.name,
            options: lodash.pick(values, optionNames)
          }, callback);
        };
      })(command, optionNames));
    }
    
    program.parse(process.argv);
  })();
};
