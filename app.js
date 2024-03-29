var childProcess = require('child_process');
var webServer = childProcess.fork('./server/server.js');
/*
function startGameServer (body) {
  if (gameServer) return;
  gameServer = spawn(body.procName, body.procArgs, body.procOptions);
  gameServer.stdout.on('data', function (data) {
    webServer.emit('stdout', data + '');
  });
  gameServer.on('exit', function (code, signal) {
    console.log('[APP] Gameserver died', code, signal);
    webServer.send({command: 'stop', body: {code: code, signal: signal}});
    gameServer = null;
  });
}
 
webServer.on('message', function (message) {
  webServer.emit(message.command, message.body);
});
*/
webServer.on('exit', function (code, signal) {
  console.log('[APP] Webserver died, retry in 10 seconds...');
  setTimeout(function () {
    webServer = childProcess.fork('./server/server.js');
  }, 10000);
});
/*
webServer.on('status', function (body) {
  var res = (gameServer) ? true : false;
  webServer.send({command: 'status', body: res});
});

webServer.on('stdin', function (body) {
  if (!gameServer) return;
  console.log('[APP] writing', body);
  gameServer.stdin.write(body + '\r');
});
*/
webServer.on('start', function (body) {
  //startGameServer(body);
});

webServer.on('stop', function () {
  //if (!gameServer) return;
  //gameServer.stdin.write('stop' + '\r');
});