var util = require('util');

function Perf() {
  this.hrstart = process.hrtime();
}

Perf.prototype.stop = function() {
  var hrsum = process.hrtime(this.hrstart);
  var memory_usage = process.memoryUsage().rss;
  return {
    time_usage: hrsum,
    time_text: util.format('%ds %dms', hrsum[0], hrsum[1]/1000000),
    memory_usage: memory_usage,
    memory_text: util.format('%d(MB)', Math.round(memory_usage/1024/1024))
  };
};

module.exports = Perf;
