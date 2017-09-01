import {Adapter} from 'js-data-adapter'
import _ from 'lodash';

export class SocketAdapter extends Adapter{

  constructor(socket, accessToken){

    super();

    this.socket = socket;

    this.accessToken = accessToken;

    this.authorization = this.authorize();

    this.authorization.catch(err => {

      console.log(err);

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

  findAll(mapper, query, opts){

    return new Promise((resolve, reject) => {

      this.authorization
        .then(() => {

          this.socket.emit('session:state:findAll', response => {

            if(response.error){
              reject(response.error)
            }else{
              resolve(response.data);
            }

          });

        });

    });

  }

}
