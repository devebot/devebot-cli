'use strict';

var fs = require('fs');

// Project metadata.
var pkg = JSON.parse(fs.readFileSync(__dirname + '/../../package.json', 'utf8'));

var appinfo = {};

// Commandline user-agent
appinfo.useragent = [pkg.name, '/', pkg.version].join('');

// Commandline header.
appinfo.displayCliHeader = function() {
  console.log('%s: %s (v%s)', pkg.name, pkg.description, pkg.version);
};

// Commandline footer.
appinfo.displayCliFooter = function() {
  [
    "",
    "------------------------------------------------------------------------------------",
    "For more information about installing and configuring devebot, please see the guide:",
    pkg.homepage,
    "",
  ].forEach(function(str) { console.log(str); });
};

module.exports = appinfo;