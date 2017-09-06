import {DataStore} from 'js-data';
import {SocketAdapter} from './SocketAdapter';
import _ from 'lodash';
import {Mapper} from 'js-data'

const debug = require('debug')('sts:socket');

export function stsData(localStorageService, socket, $q, moment, $timeout, $interval) {

  'ngInject';

  const authorization = localStorageService.get('authorization');

  if (!authorization) {
    debug('no authorization key');
    return;
  }

  const store = new DataStore();

  store.defineMapper('session', {schema: {track: true}});

  store.defineMapper('deviceFile', {schema: {track: true}});

  store.defineMapper('entity', {schema: {track: true}});

  DataStore.prototype.bindAll = storeBindAll;

  function storeBindAll(scope, filter, bind, mapper) {

    store.on('add', onChange);

    store.on('afterFindAll', onChange);

    store.on('change', onChange);

    store.on('remove', onChange);

    function onChange(mapperName) {

      if (mapperName === mapper.name) {

        _.set(scope, bind, store.filter(mapper.name, filter));

        $timeout(() => {
          scope.$apply();
        })

      }

    }

  }

  Mapper.prototype.bindAll = mapperBind;

  function mapperBind(scope, filter, bind) {

    store.bindAll(scope, filter, bind, this);

  }

  const promise = $q((resolve, reject) => {

    socket.emit('authorization', {
      accessToken: authorization
    }, response => {

      if (!response.isAuthorized) {
        debug('not authorized');
        return reject();
      }

      if (_.get(response, "error")) {
        debug(response.error);
        return reject();
      }

      socket.emit('session:state:register');

      socket.on('session:state', sessionData => {

        let {id} = sessionData;
        _.remove(store.getAll('session'), {id});
        store.add('session', [sessionData]);

      });

      socket.on('session:state:destroy', id => {

        let session = _.find(store.getAll('session'), {id});

        let lifetime = 15;

        if (session) {
          _.set(session, 'destroyed', true);
          let interval = $interval(() => {
            session.secondsToDestroy = lifetime;

            lifetime--;

            if (lifetime < 0){
              store.remove('session', session.id);
              $interval.cancel(interval);
            }

          } ,1000);

        }

      });

      resolve();

    });

  });

  const socketAdapter = new SocketAdapter(socket, promise);

  store.registerAdapter('socketAdapter', socketAdapter, {'default': true});

  return store;

}
