import timeoutCallback from 'timeout-callback';

/**
 * Created by edgarjanvuicik on 25/07/2017.
 */

export function SessionCommands(Socket, $q) {

  'ngInject';

  return {

    fullSync: deviceUUID => {

      let deferred = $q.defer();

      let command = {
        'STMSyncer': 'fullSync'
      };

      Socket.emit('device:pushCommand', deviceUUID, command, timeoutCallback(5 * 1000, (err, response) => {

        if (err) {
          deferred.reject('No answer from socket server');
        } else {
          deferred.resolve(response);
        }
      }));

      return deferred.promise;

    },

    checkObjectsForFlushing: deviceUUID => {

      let deferred = $q.defer();

      let command = {
        STMCoreObjectsController: 'checkObjectsForFlushing'
      };

      const callback = timeoutCallback(5 * 1000, (err, response) => {
        if (err) {
          deferred.reject('No answer from socket server');
        } else {
          deferred.resolve(response);
        }
      });

      Socket.emit('device:pushCommand', deviceUUID, command, callback);

      return deferred.promise;

    }

  }

}
