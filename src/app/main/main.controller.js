import _ from 'lodash';

const debug = require('debug')('sts:socket'); // eslint-disable-line

export class MainController {

  constructor($scope, $state, $transitions, moment, $timeout, toastr, StsData) {
    'ngInject';

    this.currentSesstionId = $state.params.sessionId;
    this.$state = $state;
    this.moment = moment;
    this.$scope = $scope;
    this.$timeout = $timeout;
    this.dataStore = StsData;

    let {session} = this.dataStore.models;

    $transitions.onSuccess({}, transition => {

      this.currentSesstionId = transition.params().sessionId;

    });

    session.bindAll($scope, {}, 'vm.sessions');

  }

  sessionTitle(session) {
    return _.first(session.userAgent.split(' '));
  }

  sessionClick(session) {

    this.$state.go('sessions.detail', {sessionId: session.id});

  }

  sessionClass(session) {
    return session && {
      removed: session.destroyed,
      inactive: _.get(session, 'lastStatus.url') === 'applicationDidEnterBackground' || _.get(session, 'lastStatus.url') === 'UIApplicationStateBackground',
      active: session.id === this.currentSesstionId
    };
  }

}
