import {v4} from 'uuid';

export class MainController {

  constructor(toastr, socket, $window, $timeout, localStorageService) {
    'ngInject';

    this.toastr = toastr;
    this.messageText = null;
    this.socket = socket;
    this.messages = [];
    this.$timeout = $timeout;
    this.scroller = $window.document.getElementById('messages');

    this.userId = localStorageService.get('userId');

    if (!this.userId) {
      this.userId =  v4();
      localStorageService.set('userId', this.userId);
    }

    socket.on('message', message => {
      this.addMessage(message);
      toastr.info(message.text, `From: ${message.from}`);
    });

    socket.on('welcome', messages => {
      socket.emit('setUser', this.userId);
      this.messages = messages;
      this.scrollMessages();
    })

  }

  onSubmit() {

    let text = this.messageText;

    if (!text) return;

    this.messageText = '';

    this.socket.emit('post', text, message => {
      this.addMessage(message);
    });

  }

  addMessage(message) {
    this.messages.splice(0, 0, message);
    while (this.messages.length > 50) {
      this.messages.pop()
    }
    this.scrollMessages();
  }

  scrollMessages() {
    this.$timeout(10)
      .then(() => this.scroller.scrollTop = this.scroller.scrollHeight);
  }

}
