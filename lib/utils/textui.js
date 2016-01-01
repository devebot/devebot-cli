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
      status.push('\n', util.format('Time: %s - Memory: %s', usage.time_text, usage.memory_text));
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
      renderInvalid(output);
    } else {
      var options = {};
      options.isError = (output.state == 'failed');
      var info = output.details || [];
      if (!lodash.isArray(info)) info = [info];
      info.forEach(function(infoItem) {
        renderBlock(infoItem, options);
      });
    }
  };
  
  var renderInvalid = function(result) {
    var table = new Table({
      head: ['Invalid output format. Render full result object in JSON format'],
      colWidths: [78]
    });
    table.push([JSON.stringify(result, null, 2)]);
    
    console.log('');
    console.log(table.toString());
  };
  
  var renderBlock = function(result, options) {
    printTitle(result, options);
    
    switch(result.type) {
      case 'record':
      case 'object':
        renderRecord(result);
        break;
      case 'table':
      case 'grid':
        renderTable(result);
        break;
      case 'json':
        renderJson(result);
        break;
      default:
        renderUnknown(result);
        break;
    }
  };

  var renderRecord = function(result) {
    var label = result.label;
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
    
    console.log(table.toString());
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
  
    console.log(table.toString());
  };
  
  var renderJson = function(result) {
    var table = new Table({
      head: ['JSON'], 
      colWidths: [78]
    });
    table.push([JSON.stringify(result.data, null, 2)]);
    console.log(table.toString());
  };
  
  var renderUnknown = function(result) {
    var table = new Table({
      head: ['Unknown result type'], 
      colWidths: [78]
    });
    table.push([JSON.stringify(result.data, null, 2)]);
    console.log(table.toString());
  };
  
  var printTitle = function(result, options) {
    if (lodash.isString(result.title)) {
      console.log('');
      var sign = (options && options.isError) ? '[x]' : '[v]';
      console.log('%s %s', sign, result.title);
    }
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
}

module.exports = TextUI;
