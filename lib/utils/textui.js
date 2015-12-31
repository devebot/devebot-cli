'use strict';

var lodash = require('lodash');
var util = require('util');
var Table = require('cli-table2');
var Validator = require('jsonschema').Validator;
var validator = new Validator();

var clientInfo = require('./appinfo.js');
var constx = require('./constx.js');

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
  
  this.displayCliOutput = function(output) {
    var valresult = validator.validate(output, constx.argumentSchema);
    if (valresult.errors.length > 0) {
      // var err = new Error('Output argument validation is failed');
      // err.name = 'ValidatingArgumentError';
      // throw err;
      console.log('');
      process.stdout.write(util.format('Command result: %s\n', JSON.stringify(output, null, 2)));
    } else {
      if (output.type == 'result') {
        var info = output.details || [];
        info.forEach(function(infoItem) {
          displayResult(infoItem);
        });
      }
    }
  };
  
  var displayResult = function(result) {
    if (!lodash.isObject(result)) {
      return renderInvalid(result);
    }
  
    switch(result.type) {
      case 'record':
      case 'object':
        console.log(renderRecord(result));
        break;
      case 'table':
      case 'grid':
        console.log(renderTable(result));
        break;
      case 'json':
        console.log(renderJson(result));
        break;
      default:
        console.log(renderUnknown(result));
        break;
    }
  };

  var renderRecord = function(result) {
    var label = result.label;
    var fields = Object.keys(label);
    
    var titles = [];
    fields.forEach(function(field) {
      titles.push(label[field]);
    });
    
    var data = result.data;
    var keys = Object.keys(data);
    var rows = [];
    keys.forEach(function(key) {
      if (label[key]){
        var row = {};
        row[label[key]] = data[key];
        rows.push(row);
      }
    });
  
    var table = new Table();
    rows.forEach(function(row) {
      table.push(row);
    });
    return table.toString();
  };
  
  var renderTable = function(result) {
    var label = result.label;
    var fields = Object.keys(label);
    
    var titles = [];
    fields.forEach(function(field) {
      titles.push(label[field]);
    });
    
    var data = result.data;
    var rows = [];
    data.forEach(function(object) {
      var row = [];
      for(var i=0; i<fields.length; i++) {
        row.push(object[fields[i]]);
      }
      rows.push(row);
    });
  
    var table = new Table({
      head: titles
    });
  
    rows.forEach(function(row) {
      table.push(row);
    });
  
    return table.toString();
  };
  
  var renderJson = function(result) {
    var table = new Table({
      head: ['JSON object'], 
      colWidths: [78]
    });
    table.push([JSON.stringify(result.data, null, 2)]);
    return table.toString();
  };
  
  var renderUnknown = function(result) {
    var table = new Table({
      head: ['Unknown result type'], 
      colWidths: [78]
    });
    table.push([JSON.stringify(result.data, null, 2)]);
    return table.toString();
  };
  
  var renderInvalid = function(result) {
    var table = new Table({
      colWidths: [78]
    });
    table.push([
      'Invalid command result. The result should be an object.'
    ]);
    console.log(table.toString());
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
