/* global angular:false*/

import {config, localStorageConfig} from './index.config';
import {routerConfig} from './index.route';
import {runBlock} from './index.run';
import {MainController} from './main/main.controller';
import io from 'socket.io-client';

angular.module('stsClient', [
  'ngAnimate',
  'ngCookies',
  'ngTouch',
  'ngSanitize',
  'ngMessages',
  'ngAria',
  'ui.router',
  'ui.bootstrap',
  'toastr',
  'btford.socket-io',
  'angularMoment',
  'LocalStorageModule',
  'ngTable'
])
  .config(config)
  .config(localStorageConfig)
  .config(routerConfig)
  .run(runBlock)
  .controller('MainController', MainController)

  .factory('socket', socketFactory => socketFactory({ioSocket: io.connect()}))
;
