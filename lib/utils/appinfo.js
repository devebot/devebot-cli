'use strict';

var fs = require('fs');
var lodash = require('lodash');

// Program package information
var pkgProgram = JSON.parse(fs.readFileSync('package.json', 'utf8'));
var pkgDevebot = JSON.parse(fs.readFileSync(__dirname + '/../../package.json', 'utf8'));

var appinfo = lodash.pick(pkgProgram || pkgDevebot, 
    ['version', 'name', 'description', 'homepage', 'author', 'license']);

// Commandline user-agent
appinfo.useragent = [appinfo.name, '/', appinfo.version].join('');

module.exports = appinfo;
