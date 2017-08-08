/**
 * Created by edgarjanvuicik on 25/07/2017.
 */

import _ from 'lodash';

export function sessionData(socket, $rootScope, $q) {

  'ngInject';

  socket.emit('authorization', {
    accessToken: '75b6851354d3498031a587daeecd09ef@pha'
  });

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

  return {

    findAll: () => {

      return this.sessions;

    },

    find: (id) => {

      return _.find(this.sessions, {id});

    },

    getDeviceFiles: (deviceUUID) => {

      let deferred = $q.defer();

      let request = {

        "STMCoreSessionFiler": {
          "JSONOfFilesAtPath:": "/"
        }

      };

      socket.emit('device:pushRequest', deviceUUID, request, response => {

        deferred.resolve(_.get(response,"STMCoreSessionFiler.JSONOfFilesAtPath:"));
        // deferred.resolve(response);

      });

      return deferred.promise;

    }

  }

}
