const debug = require('debug')('sts:socket'); // eslint-disable-line
import _ from 'lodash';
import {SocketAdapter} from './SocketAdapter'
import angular from 'angular';



export function Auth(localStorageService, toastr, Socket, StsData, $rootScope) {

  'ngInject';

  let authorizationState = null;

  return{

    getAuthorizationState: () =>{
      return authorizationState;
    },

    authorize(token){

      if (!token){
        token = localStorageService.get('authorization');
        debug(token);
      }

      if (!token) {
        toastr.error('No Auth key');
        return;
      }

      authorizationState = new Promise((resolve, reject) => {

        Socket.emit('authorization', {
          accessToken: token
        }, response => {

          if (!response.isAuthorized) {
            return reject('not authorized');
          }

          if (_.get(response, "error")) {
            return reject(response.error);
          }

          resolve();

        });
      });

      return authorizationState.then(() => {

        const socketAdapter = new SocketAdapter(Socket);

        StsData.setScope($rootScope);

        StsData.registerAdapter('socketAdapter', socketAdapter, {'default': true});

        socketAdapter.subscribe(StsData);

        let {session} = StsData.models;

        return session.findAll({})
          .catch(err => {
            toastr.error(angular.toJson(err));
            debug(err);
          });

      }).catch(err => {
        toastr.error(err);
        debug(err);
      });

    }
  }

}

