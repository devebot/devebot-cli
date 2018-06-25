'use strict';

var fs = require('fs');
var lodash = require('lodash');
var logger = require('./logger.js');

// Program package information
var pkgDevebot;
var pkgProgram;

try {
  pkgDevebot = JSON.parse(fs.readFileSync(__dirname + '/../../package.json', 'utf8'));
  pkgProgram = JSON.parse(fs.readFileSync(__dirname + '/../../../../package.json', 'utf8'));
} catch(error) {
  logger.warn(' - Error on loading package.json information: %s', JSON.stringify(error));
}

var appinfo = lodash.pick(pkgProgram || pkgDevebot, 
    ['version', 'name', 'description', 'homepage', 'author', 'contributors', 'license']);

// Commandline user-agent
appinfo.useragent = [appinfo.name, '/', appinfo.version].join('');

module.exports = appinfo;
