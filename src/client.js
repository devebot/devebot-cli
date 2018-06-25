'use strict';

var Promise = require('bluebird');
var lodash = require('lodash');
var util = require('util');
var program = require('commander');
var DevebotApi = require('devebot-api');

var Config = require('../lib/utils/config');
var TextUI = require('../lib/utils/textui');
var Myperf = require('../lib/utils/myperf');
var logger = require('../lib/utils/logger');

module.exports = function(params) {
  params = params || {};

  var adapter = params.adapter;
  var listener = params.listener;
  var tui;

  if (lodash.isObject(adapter)) {
    tui = new TextUI();
  } else {
    var cfgObj = new Config(params);
    var cfg = cfgObj.getConfig();
    adapter = new DevebotApi(lodash.extend(cfg, {
      logger: logger,
      ws: listener
    }));
    var mpfObj = new Myperf();
    tui = new TextUI({ config: cfgObj, myperf: mpfObj });
  }

  adapter.on('started', function() {
    logger.debug(' The command is started');
  });
  
  adapter.on('progress', function(data) {
    logger.debug(' The command is processing');
  });
  
  adapter.on('completed', function(data) {
    tui.displayCliOutput(data);
  });
  
  adapter.on('failed', function(data) {
    tui.displayCliOutput(data);
  });
  
  adapter.on('done', function() {
    logger.debug(' - The command is done');
  });
  
  adapter.on('noop', function() {
    logger.debug(' - The command not found');
  });

  adapter.on('close', function(code, message) {
    logger.debug(' - The connection is closed (%s). Message: %s', code, message);
  });
  
  adapter.on('error', function(error) {
    logger.debug(' - The connection has been broken - %s', error);
    tui.displayException(error);
  });

  var init = Promise.promisify(adapter.loadDefinition, { context: adapter });
  init().then(function(clidef) {
    tui.displayCliHeader(clidef);
    return run(adapter, clidef);
  }).then(function() {
    tui.displayCliFooter(clidef);
  }).catch(function(exception) {
    tui.displayException(exception);
  });
};

var run = function(adapter, clidef) {
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
          adapter.execCommand({
            name: command.name,
            options: lodash.pick(values, optionNames)
          }, callback);
        };
      })(command, optionNames));
    }
    
    program.parse(process.argv);
    
    if (process.argv.length <= 2) {
      program.outputHelp(function(helptext) {
        process.stdout.write(helptext);
        callback();
      });
    }
  })();
};
