import {DataStore} from 'js-data';
import {SocketAdapter} from './SocketAdapter';

export function stsData(localStorageService, socket, $log) {

  'ngInject';

  const store = new DataStore();

  const authorization = localStorageService.get('authorization');

  const socketAdapter = new SocketAdapter(socket, authorization, $log);

  store.registerAdapter('socketAdapter', socketAdapter, {'default': true});

  store.defineMapper('session');

  store.defineMapper('deviceFile');

  store.defineMapper('entity');

  return store;

}
