const debug = require('debug')('sts:socket'); // eslint-disable-line
import _ from 'lodash';
import {SocketAdapter} from './SocketAdapter'

export function auth(localStorageService, toastr, socket, StsData, $rootScope) {

  'ngInject';

  const authorization = localStorageService.get('authorization');

  if (!authorization) {
    toastr.error('No auth key');
    return;
  }

  let promise = new Promise((resolve, reject) => {

    socket.emit('authorization', {
      accessToken: authorization
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

  return promise.then(() => {

    const socketAdapter = new SocketAdapter(socket);

    StsData.setScope($rootScope);

    StsData.registerAdapter('socketAdapter', socketAdapter, {'default': true});

    socketAdapter.subscribe(StsData);


  }).catch(err => {
    toastr.error(err);
    debug(err);
  });

}
