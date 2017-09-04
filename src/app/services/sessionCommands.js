/**
 * Created by edgarjanvuicik on 25/07/2017.
 */

export function sessionCommands(socket, $q) {

  'ngInject';

  return {

    fullSync: deviceUUID => {

      let deferred = $q.defer();

      let command = {
        "STMSyncer": "fullSync"
      };

      let timeoutCallback = require('timeout-callback');

      socket.emit('device:pushCommand', deviceUUID, command, timeoutCallback(5 * 1000, (err, response) => {

        if (err) {
          deferred.reject("No answer from socket server");
        } else {
          deferred.resolve(response);
        }
      }));

      return deferred.promise;

    }

  }

}
