/**
 * Created by edgarjanvuicik on 25/07/2017.
 */

import _ from 'lodash';

export function sessionData(socket, $rootScope, $q, localStorageService, $log) {

  'ngInject';

  const authorization = localStorageService.get('authorization');

  if (!authorization) {
    return $log.error('authorization item is not set');
  }

  socket.emit('authorization', {
    accessToken: authorization
  }, response => {

    if (_.get(response, "isAuthorized")) {
      $log.log("Authorized: " + response.isAuthorized)
    }
    if (_.get(response, "error")) {
      $log.error(response.error);
    }

    socket.emit('session:state:findAll', response => {
      this.sessions = response.data;
      $rootScope.$broadcast('initialSessions');
    });

    socket.emit('session:state:register');

    socket.on('session:state', sessionData => {

      let {id} = sessionData;
      _.remove(this.sessions, {id});
      this.sessions.push(sessionData);
      $rootScope.$broadcast('receivedSession');
    });

    socket.on('session:state:destroy', id => {

      let session = _.find(this.sessions, {id});
      _.set(session, 'destroyed', true);
      $rootScope.$broadcast('destroyedSession');

    });

  });

  return {

    findAll: () => {

      return this.sessions;

    },

    find: id => {

      return _.find(this.sessions, {id});

    },

    getDeviceFiles: deviceUUID => {

      let deferred = $q.defer();

      let request = {

        "STMCoreSessionFiler": {
          "JSONOfFilesAtPath:": "/"
        }

      };

      socket.emit('device:pushRequest', deviceUUID, request, response => {

        deferred.resolve(_.get(response, "STMCoreSessionFiler.JSONOfFilesAtPath:"));

      });

      return deferred.promise;

    },

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

    }

  }

}
