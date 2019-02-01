import {Adapter} from 'js-data-adapter'
import _ from 'lodash';

const debug = require('debug')('sts:socket'); // eslint-disable-line

export class SocketAdapter extends Adapter {

  constructor(socket) {

    super();

    this.socket = socket;

  }

  subscribe(store) {

    this.socket.emit('session:state:register');

    this.socket.on('session:state', sessionData => {

      let {id} = sessionData;
      _.remove(store.getAll('session'), {id});
      store.add('session', [sessionData]);

    });

    this.socket.on('session:state:destroy', id => {

      let session = _.find(store.getAll('session'), {id});

      let lifetime = 15;

      if (session) {
        _.set(session, 'destroyed', true);
        let interval = setInterval(() => {  // eslint-disable-line
          session.secondsToDestroy = lifetime;

          lifetime--;

          if (lifetime < 0) {
            store.remove('session', session.id);
            clearInterval(interval);
          }

        }, 1000);

      }

    });

  }

  findAll(mapper, query, opts) { // eslint-disable-line

    return new Promise((resolve, reject) => {

      let UUID = _.get(query, 'deviceUUID');

      let level = _.get(query, 'level');

      let path = _.get(query, 'path');

      let entityName = _.get(query, 'entityName');

      let pageSize = _.get(query, 'pageSize');

      let startPage = _.get(query, 'startPage');

      let request = {};

      switch (mapper.name) {
        case 'session':
          this.socket.emit('session:state:findAll', response => {

            if (response.error) {
              reject(response.error)
            } else {
              resolve(response.data);
            }

          });
          break;

        case 'deviceFile':

          if (!UUID) {
            reject('deviceUUID is not defined');
            break;
          }

          request = {

            "STMCoreSessionFiler": {
              "JSONOfFilesAtPath:": "/"
            }

          };

          let get = 'STMCoreSessionFiler.JSONOfFilesAtPath:';

          if (level) {

            request = {

              "STMCoreSessionFiler": {
                "levelFilesAtPath:": level
              }

            };

            get = 'STMCoreSessionFiler.levelFilesAtPath:';

          }

          if (path) {

            request = {

              "STMCoreSessionFiler": {
                "base64ofFileAtPath:": path
              }

            };

            get = 'STMCoreSessionFiler.base64ofFileAtPath:';

          }

          this.socket.emit('device:pushRequest', UUID, request, response => {

            let result = _.get(response, get);

            if (result) {
              if (!_.isObject(result)){
                result = {
                  result
                }
              }
              resolve(result);
            }else{
              reject(response);
            }

          });

          break;

        case 'entity':

          if (!UUID) {
            reject('deviceUUID is not defined');
            break;
          }

          if (!entityName) {
            reject('entityName is not defined');
            break;
          }

          request = {
            "STMRemotePersisterController": {
              "findAllRemote:": {
                entityName,
                options: {
                  pageSize,
                  startPage,
                  sortBy: 'lts,deviceTs',
                  direction: 'DESC'
                }
              }
            }
          };

          this.socket.emit('device:pushRequest', UUID, request, response => {

            let result = _.get(response, "STMRemotePersisterController.findAllRemote:");

            if (result){
              console.info (result);
              resolve(result);
            }else{
              reject(response);
            }

          });

          break;
      }

    });

  }

  count(mapper, query, opts){ // eslint-disable-line

    return new Promise((resolve, reject) => {

      let request = {};

      let entityName = _.get(query, 'entityName');

      let UUID = _.get(query, 'deviceUUID');

      switch (mapper.name) {

        case "entity":

          request = {
            "STMRemotePersisterController": {
              "countRemote:": {
                "entityName": entityName
              }
            }
          };

          this.socket.emit('device:pushRequest', UUID, request, response => {

            let result = _.get(response, "STMRemotePersisterController.countRemote:");

            if (result){
              resolve(result);
            }else{
              reject(response);
            }

          });

          break;

      }

    });

  }

  destroyAll(mapper, query, opts){ // eslint-disable-line

    debug('device:pushRequest');

    return new Promise(((resolve, reject) => {

      let UUID = _.get(query, 'deviceUUID');

      let level = _.get(query, 'level');

      let request = {};

      switch (mapper.name) {

        case 'deviceFile':

          let get = 'STMCoreSessionFiler.removeFilesAtPath:';

          if (level) {

            request = {

              "STMCoreSessionFiler": {
                "removeFilesAtPath:": level
              }

            };

          }

          this.socket.emit('device:pushRequest', UUID, request, response => {

            debug(response);

            let result = _.get(response, get);

            debug(result);

            if (!result){
              resolve();
            }else{
              reject(response);
            }

          });

          break;

      }

    }));

  }

}
