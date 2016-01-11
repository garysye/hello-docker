$(document).ready(function() {
  var logs = {aggregate: {}, raw: [], lastUpdates: {}};
  var logsHelloWorld = {aggregate: {}, raw: []};

  var aggregateLogs = function(newLogs, logs, lastInd) {
    // var dateMethods = {
    //   first: {
    //     name: 'year',
    //     method: 'getFullYear',
    //     next: {
    //       name: 'month',
    //       method: 'getMonth',
    //       next: {
    //         name: 'day',
    //         method: 'getDay',
    //         next: {
    //           name: 'hour',
    //           method: 'getHours',
    //           next: {
    //             name: 'minute',
    //             method: 'getMinutes',
    //           }
    //         }
    //       }
    //     }
    //   }
    // };
    var log, date, ip, dateLevel, aggregateLevel, dateLevelVal, dateMinutes;
    lastInd = lastInd || - 1;
    for (var i = lastInd + 1; i < newLogs.length; i++) {
      log = newLogs[i];
      // date = new Date(log.timestamp);
      dateMinutes = new Date(log.timestamp).setMinutes(0, 0, 0);
      ip = log.IP;
      logs.aggregate[ip] = logs.aggregate[ip] || {};
      logs.aggregate[ip][dateMinutes] = logs.aggregate[ip][dateMinutes] + 1 || 1;
      logs.raw.push(log);
      // dateLevel = dateMethods.first;
      // aggregateLevel = aggregate;
      // dateLevelVal;
      // while (dateLevel) {
      //   dateLevelVal = date[dateLevel.method]();
      //   aggregateLevel[dateLevelVal] = aggregateLevel[dateLevelVal] || {};
      //   aggregateLevel = aggregateLevel[dateLevelVal];
      //   dateLevel = dateLevel.next;
      // }
      // if (i === lastInd + 1 && aggregate[i].date === dateMinutes) {
      //   aggregate
      // }
    };
    return logs;
  }

  var updateLogsDisplay = function(logs, className, lastUpdateInd) {
    console.log(lastUpdateInd);
    var $logs = $('.' + className);
    var $raw = $logs.children('.display-raw');
    var $aggregate = $logs.children('.display-aggregate');
    var $newRow, log, $ip, $dateRow, ipId, dateId;
    for (var i = lastUpdateInd + 1, len = logs.raw.length; i < len; i++) {
      log = logs.raw[i];
      $newRow = $('<tr>');
      $('<div>').text('IP: ' + log.IP).appendTo($newRow);
      $('<div>').text('Time: ' + new Date(log.timestamp).toDateString()).appendTo($newRow);
      $raw.append($newRow);
    }
    for (var ip in logs.aggregate) {
      ipId = ip.replace(/[.]/g, '-');
      $ip = $aggregate.children('#' + ipId);
      if ($ip.length === 0) {
        $ip = $('<ul>').attr('id', ipId).text('IP :' + ip);
        $ip.appendTo('<tr>').appendTo($aggregate);
      }
      for (var date in logs.aggregate[ip]) {
        dateId = date.replace('.', '-');
        $dateRow = $ip.children('#' + dateId);
        if ($dateRow.length === 0) {
          $dateRow = $('<li>').attr('id', dateId);
          $ip.append($dateRow);
        }
        $dateRow.text(new Date(+date).toDateString() + ': ' + logs.aggregate[ip][date]);
      }
    }
  };

  $.ajax({
    url: '/v1/logs',
    method: 'GET'
  })
    .done(function(data) {
      var lastUpdateInd = logs.raw.length - 1;
      for (var key in data.logs) {
        aggregateLogs(data.logs[key], logs, logs.lastUpdates[key]);
        logs.lastUpdates[key] = data.logs[key].length - 1;
      }
      updateLogsDisplay(logs, 'logs-all', lastUpdateInd);
    });
  $.ajax({
    url: '/v1/hello-world/logs',
    method: 'GET'
  })
    .done(function(data) {
      var lastUpdateInd = logsHelloWorld.raw.length - 1;
      aggregateLogs(data, logsHelloWorld, lastUpdateInd);
      updateLogsDisplay(logsHelloWorld, 'logs-hello-world', lastUpdateInd);
    });
});
