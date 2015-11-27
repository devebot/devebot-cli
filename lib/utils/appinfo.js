'use strict';

var fs = require('fs');
var lodash = require('lodash');

// Project metadata.
var pkg = JSON.parse(fs.readFileSync(__dirname + '/../../package.json', 'utf8'));
var pkgAppinfo = lodash.pick(pkg, ['version', 'name', 'description', 'homepage', 'author', 'license']);

var appinfo = {};

// Commandline user-agent
appinfo.useragent = [pkg.name, '/', pkg.version].join('');

// Commandline header.
appinfo.displayCliHeader = function(clidef) {
  clidef = clidef || {};
  var info = clidef.appinfo || pkgAppinfo;
  console.log('%s: %s (v%s)', info.name, info.description, info.version);
};

// Commandline footer.
appinfo.displayCliFooter = function(clidef) {
  clidef = clidef || {};
  var info = clidef.appinfo || pkgAppinfo;
  [
    "",
    "------------------------------------------------------------------------------------",
    "For more information about installing and configuring devebot, please see the guide:",
    info.homepage || pkgAppinfo.homepage,
    "",
  ].forEach(function(str) { console.log(str); });
};

module.exports = appinfo;