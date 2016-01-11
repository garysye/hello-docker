$(document).ready(function() {
  var logs = {aggregate: {}, raw: [], lastUpdates: {}};
  var logsHelloWorld = {aggregate: {}, raw: []};

  // Updates logs with latest data from server
  var aggregateLogs = function(newLogs, logs, lastInd) {
    var log, date, ip, dateMinutes;
    // If no last index passed, dfeault to -1
    lastInd = lastInd || - 1;

    // Starting on the last index, iterates through the updates, stores the raw log, and updates the aggregate
    for (var i = lastInd + 1; i < newLogs.length; i++) {
      log = newLogs[i];
      dateMinutes = new Date(log.timestamp).setSeconds(0, 0);
      ip = log.IP;
      logs.aggregate[ip] = logs.aggregate[ip] || {};
      logs.aggregate[ip][dateMinutes] = logs.aggregate[ip][dateMinutes] + 1 || 1;
      logs.raw.push(log);
    };
    return logs;
  }

  // Upon update from the server, goes through the logs and updates the DOM as needed;
  var updateLogsDisplay = function(logs, className, lastUpdateInd) {
    var $logs = $("." + className);
    var $raw = $logs.children(".display-raw");
    var $aggregate = $logs.children(".display-aggregate");
    var $newRow, log, $ip, $dateRow, ipId, dateId;
    // Goes from the last index, and adds new logs to the raw logs table
    for (var i = lastUpdateInd + 1, len = logs.raw.length; i < len; i++) {
      log = logs.raw[i];
      $newRow = $("<tr>").addClass("row-raw");
      $("<div>").text("IP: " + log.IP).appendTo($newRow);
      $("<div>").text("Time: " + new Date(log.timestamp).toLocaleString()).appendTo($newRow);
      $raw.append($newRow);
    }
    // Goes through the aggregate and updates them as needed
    for (var ip in logs.aggregate) {
      // Modifies the ip to a HTML-usable id and tries to locate the specific table
      ipId = ip.replace(/[.]/g, '-');
      $ip = $aggregate.children("#" + ipId);
      // If it cannot find an existing table for that IP, creates a new one
      if ($ip.length === 0) {
        $ip = $("<table>").attr("id", ipId).addClass("table-aggregate");
        $("<tr>").text("IP :" + ip).addClass("entry-ip").appendTo($ip);
        $ip.appendTo("<tr>").appendTo($aggregate);
      }
      // For each date with an aggregated count, it will try to find the right element; creates one if it cannot find one
      for (var date in logs.aggregate[ip]) {
        $dateRow = $ip.find("#" + date);
        if ($dateRow.length === 0) {
          $dateRow = $("<tr>").attr("id", date).addClass("entry-date");
          $ip.append($dateRow);
        }
        $dateRow.text(new Date(+date).toLocaleString() + ": " + logs.aggregate[ip][date]);
      }
    }
  };

  // Gets all logs from the /v1/logs endpoint
  var getAllLogs = function () {
    $.ajax({
      url: '/v1/logs',
      method: 'GET'
    })
      .done(function(data) {
        var lastUpdateInd = logs.raw.length - 1;
        data.logset.forEach(function(endpointLog) {
          aggregateLogs(endpointLog.logs, logs, logs.lastUpdates[endpointLog.endpoint]);
          logs.lastUpdates[endpointLog.endpoint] = endpointLog.logs.length - 1;
        });
        updateLogsDisplay(logs, 'logs-all', lastUpdateInd);
      });
  };
  // Gets all logs from the /v1/hello-world/logs endpoint
  var getHelloWorldLogs = function() {
    $.ajax({
      url: '/v1/hello-world/logs',
      method: 'GET'
    })
      .done(function(data) {
        var lastUpdateInd = logsHelloWorld.raw.length - 1;
        console.log(data);
        aggregateLogs(data, logsHelloWorld, lastUpdateInd);
        updateLogsDisplay(logsHelloWorld, 'logs-hello-world', lastUpdateInd);
      });
  };

  // Kicks off API requests and call its again every minute
  getAllLogs();
  getHelloWorldLogs();
  setInterval(function() {
    getAllLogs();
    getHelloWorldLogs();
  }, 15000);
});
