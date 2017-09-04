import {Adapter} from 'js-data-adapter'
import _ from 'lodash';

export class SocketAdapter extends Adapter{

  constructor(socket, accessToken, $log){

    super();

    this.socket = socket;

    this.accessToken = accessToken;

    this.$log = $log;

    this.authorization = this.authorize()
      .catch(err => {

      this.$log.error(err);

    });

  }

  authorize(){

    return new Promise((resolve, reject) => {

      if (!this.accessToken) {
        return reject('authorization item is not set');
      }

      this.socket.emit('authorization', {
        accessToken: this.accessToken
      }, response => {

        if (!response.isAuthorized){
          return reject('not authorized');
        }
        if (_.get(response, "error")) {
          return reject(response.error);
        }

        return resolve();

        // socket.emit('session:state:register');
        //
        // socket.on('session:state', sessionData => {
        //
        //   let {id} = sessionData;
        //   _.remove(this.sessions, {id});
        //   this.sessions.push(sessionData);
        //   $rootScope.$broadcast('receivedSession');
        //
        // });
        //
        // socket.on('session:state:destroy', id => {
        //
        //   let session = _.find(this.sessions, {id});
        //
        //   const lifetime = 15;
        //
        //   session.willBeDestroyedAt = moment().add(lifetime, 'seconds');
        //
        //   _.set(session, 'destroyed', true);
        //   $rootScope.$broadcast('destroyedSession', session);
        //
        // });

      });

    });

  }

  beforeFindAll(mapper, query, opts){

    return this.authorization;

  }

  findAll(mapper, query, opts){

    return new Promise((resolve, reject) => {

      switch (mapper.name){
        case 'session':
          this.socket.emit('session:state:findAll', response => {

            if(response.error){
              reject(response.error)
            }else{
              this.session = response.data;
              resolve(response.data);
            }

          });
          break;

        case 'deviceFile':

          const UUID = _.get(query,'where.deviceUUID');

          const level = _.get(query,'where.level');

          if (UUID){

            let request = {

              "STMCoreSessionFiler": {
                "JSONOfFilesAtPath:": "/"
              }

            };

            let get = 'STMCoreSessionFiler.JSONOfFilesAtPath:';

            if (level){

              request = {

                "STMCoreSessionFiler": {
                  "levelFilesAtPath:": level
                }

              };

              get = 'STMCoreSessionFiler.levelFilesAtPath:';

            }

            this.socket.emit('device:pushRequest', UUID, request, response => {

              resolve(_.get(response, get));

            });

          }else {
            reject('deviceUUID is not defined');
          }

          break;
      }

    });

  }

  find(mapper, id, opts){

    return new Promise((resolve, reject) => {

      switch(mapper.name){

        case 'session':
          resolve(_.find(this.session, {id}));
          break;

      }

    });

  }

}
