'use strict';

var appRootPath = require('app-root-path');
var fs = require('fs');
var path = require('path');
var lodash = require('lodash');
var logger = require('./logger.js');

// Program package information
var pkgProgram;

try {
  pkgProgram = JSON.parse(fs.readFileSync(path.join(appRootPath.toString(), 'package.json'), 'utf8'));
} catch(error) {
  logger.warn(' - Error on loading package.json information: %s', JSON.stringify(error));
}

var appinfo = lodash.pick(pkgProgram,
    ['version', 'name', 'description', 'homepage', 'author', 'contributors', 'license']);

// Commandline user-agent
appinfo.useragent = [appinfo.name, '/', appinfo.version].join('');

module.exports = appinfo;
