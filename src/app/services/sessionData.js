/**
 * Created by edgarjanvuicik on 25/07/2017.
 */

import _ from 'lodash';

export function sessionData(socket, $rootScope, $q, localStorageService, $log) {
export function sessionData(socket, $rootScope, $q, localStorageService, $log, moment, $timeout) {

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

      const lifetime = 15;

      $timeout(lifetime * 1000)
        .then(() => {
          _.remove(this.sessions, session);
        });

      session.willBeDestroyedAt = moment().add(lifetime, 'seconds');

      _.set(session, 'destroyed', true);
      $rootScope.$broadcast('destroyedSession', session);

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

    getDeviceFilesAtLevel: (deviceUUID, level) => {

      let deferred = $q.defer();

      let request = {

        "STMCoreSessionFiler": {
          "levelFilesAtPath:": level
        }

      };

      socket.emit('device:pushRequest', deviceUUID, request, response => {

        deferred.resolve(_.get(response, "STMCoreSessionFiler.levelFilesAtPath:"));

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
