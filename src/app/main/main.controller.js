import _ from 'lodash';

export class MainController {

  constructor($scope, sessionData, $state, $transitions, moment, $timeout, $interval) {
    'ngInject';

    this.currentSesstionId = $state.params.sessionId;
    this.$state = $state;
    this.moment = moment;
    this.$scope = $scope;
    this.$timeout = $timeout;

    $transitions.onSuccess({}, transition => {

      this.currentSesstionId = transition.params().sessionId;

    });

    $scope.$on('initialSessions', () => {
      this.sessions = sessionData.findAll();
    });

    $scope.$on('$destroy', this.cancelTimeout);

    this.interval = $interval(1000)
      .then(() => $scope.$apply());

  }

  cancelTimeout () {
    this.interval.cancel();
  }

  secondsToDestroy (session) {

    if(!session.willBeDestroyedAt){
      return;
    }

    // this.$timeout(1000);

    let dif = - this.moment().diff(session.willBeDestroyedAt, 'seconds');

    if (dif < 0){
      _.remove(this.sessions, session);
    }

    return dif;
  }

  sessionTitle (session) {
    return _.first(session.userAgent.split(' '));
  }

  sessionClick (session) {

    this.$state.go('sessions.detail', {sessionId: session.id});

  }

  sessionClass (session) {
    return session && {
      removed: session.destroyed,
      inactive: _.get(session, 'lastStatus.url') === 'applicationDidEnterBackground',
      active: session.id === this.currentSesstionId
    };
  }

}
