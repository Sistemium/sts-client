/* global angular:false*/

import {config, localStorageConfig, cgBusyDefaults, localStorageServiceConfig} from './index.config';
import {routerConfig} from './index.route';
import {runBlock} from './index.run';
import {MainController} from './main/main.controller';
import {DetailController} from './detail/detail.controller';
import {sessionData} from '../app/services/sessionData';
import io from 'socket.io-client';
import {reduceObject} from './filters/reduceObject';

require('ng-table');
require('angular-local-storage');

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
  'ngTable',
  'ui.tree',
  'cgBusy',
  'LocalStorageModule'
])
  .config(config)
  .config(localStorageConfig)
  .config(routerConfig)
  .config(localStorageServiceConfig)
  .run(runBlock)
  .controller('MainController', MainController)
  .controller('DetailController', DetailController)
  .factory('socket', socketFactory => socketFactory({ioSocket: io.connect()}))
  .factory('sessionData', sessionData)
  .filter('reduceObject', reduceObject)
  .value('cgBusyDefaults', cgBusyDefaults)
;
