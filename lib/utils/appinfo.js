/*
 * devebot-cli
 * https://github.com/devebot
 */

'use strict';

// Project metadata.
var pkg = require('../../package.json');

// Commandline header.
exports.displayCliHeader = function() {
  console.log('%s: %s (v%s)', pkg.name, pkg.description, pkg.version);
};

// Commandline footer.
exports.displayCliFooter = function() {
  [
    "",
    "------------------------------------------------------------------------------------",
    "For more information about installing and configuring devebot, please see the guide:",
    pkg.homepage,
    "",
  ].forEach(function(str) { console.log(str); });
};
