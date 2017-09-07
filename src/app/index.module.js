/* global angular:false moment:false */

import {config, localStorageConfig, cgBusyDefaults, localStorageServiceConfig} from './index.config';
import {routerConfig} from './index.route';
import {runBlock} from './index.run';
import {MainController} from './main/main.controller';
import {DetailController} from './detail/detail.controller';
import {AuthController} from './auth/auth.controller';
import {sessionCommands} from './services/sessionCommands';
import {stsData} from '../app/services/stsData';
import io from 'socket.io-client';
import {reduceObject} from './filters/reduceObject';
import {ResizeDirective} from '../app/components/resize.directive';

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
  .controller('AuthController', AuthController)
  .factory('socket', socketFactory => socketFactory({ioSocket: io.connect()}))
  .factory('sessionCommands', sessionCommands)
  .factory('stsData', stsData)
  .filter('reduceObject', reduceObject)
  .directive('resize', ResizeDirective)
  .value('cgBusyDefaults', cgBusyDefaults)
  .constant('moment', moment)
;
