import {DataStore} from 'js-data';
import {SocketAdapter} from './SocketAdapter';

export function stsData(localStorageService, socket) {

  'ngInject';

  const store = new DataStore();

  const authorization = localStorageService.get('authorization');

  const socketAdapter = new SocketAdapter(socket, authorization);

  store.registerAdapter('socketAdapter',socketAdapter,{ 'default': true });

  store.defineMapper('session');

  return store;

}
