import _ from 'lodash';

export class MainController {

  constructor($scope, $state, $transitions, moment, $interval, stsData) {
    'ngInject';

    this.currentSesstionId = $state.params.sessionId;
    this.$state = $state;
    this.moment = moment;
    this.$scope = $scope;

    $transitions.onSuccess({}, transition => {

      this.currentSesstionId = transition.params().sessionId;

    });

    stsData.findAll('session')
      .then(sessions => {
        this.sessions = sessions;
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
      inactive: _.get(session, 'lastStatus.url') === 'applicationDidEnterBackground' || _.get(session, 'lastStatus.url') === 'UIApplicationStateBackground',
      active: session.id === this.currentSesstionId
    };
  }

}
