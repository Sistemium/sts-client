import {DataStore} from 'js-data';
import {SocketAdapter} from './SocketAdapter';
import _ from 'lodash';

const debug = require('debug')('sts:socket');  // eslint-disable-line

export function stsData(socket, $timeout) {

  'ngInject';

  const store = new DataStore();

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

  const socketAdapter = new SocketAdapter(socket);

  store.registerAdapter('socketAdapter', socketAdapter, {'default': true});

  store.models = {};

  store.defineModel = defineModel;

  socketAdapter.subscribe(store);

  function defineModel(name, config) {

    const mapperConfig = _.assign({
      schema: {track: true}
    }, config || {});

    const modelMapper = store.defineMapper(name, mapperConfig);

    const model = {
      findAll: (params, options) => store.findAll('session', params, options),
      bindAll: (scope, filter, bind) => storeBindAll(scope, filter, bind, modelMapper)
    };

    store.models[name] = model;

    return model;

  }

  return store;

}
