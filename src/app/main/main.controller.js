import _ from 'lodash';

export class MainController {

  constructor(socket) {
    'ngInject';

    // this.socket = socket;
    // this.sessions = [];

    socket.emit('authorization', {
      accessToken: '75b6851354d3498031a587daeecd09ef@pha'
    });

    socket.emit('session:state:findAll', response => {
      this.sessions = response.data;
    });

    socket.emit('session:state:register');

    socket.on('session:state', sessionData => {

      let {id} = sessionData;
      _.remove(this.sessions, {id});
      this.sessions.push(sessionData);

    });

    socket.on('session:state:destroy', id => {

      let session = _.find(this.sessions, {id});
      _.set(session, 'destroyed', true);

    });

  }

}
