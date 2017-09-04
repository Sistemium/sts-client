/**
 * Created by edgarjanvuicik on 25/07/2017.
 */

import _ from 'lodash';

export function sessionData(socket, $q) {

  'ngInject';

  return {

    getDeviceData: deviceUUID => {

      let deferred = $q.defer();

      let request = {
        "STMRemotePersisterController": {
          "findAllRemote:": {
            "entityName": "STMEntity"
          }
        }
      };

      socket.emit('device:pushRequest', deviceUUID, request, response => {

        deferred.resolve(_.get(response, "STMRemotePersisterController.findAllRemote:"));

      });

      return deferred.promise;

    },

    getEntityData: (deviceUUID, entityName) => {

      let deferred = $q.defer();

      let request = {
        "STMRemotePersisterController": {
          "findAllRemote:": {
            "entityName": entityName
          }
        }
      };

      socket.emit('device:pushRequest', deviceUUID, request, response => {

        deferred.resolve(_.get(response, "STMRemotePersisterController.findAllRemote:"));

      });

      return deferred.promise;

    },

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
