import _ from 'lodash';
const debug = require('debug')('sts:socket'); // eslint-disable-line

export class AuthController {

  constructor($state, localStorageService, toastr, socket) {

    'ngInject';

    const authorization = localStorageService.get('authorization');

    if (!authorization) {
      toastr.error('No auth key');
      return;
    }

    socket.authorization = new Promise((resolve, reject) => {

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

    socket.authorization.then(() => {
      $state.go('sessions');
    }).catch(err => {
      toastr.error(err);
    });

  }
}
