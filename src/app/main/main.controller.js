import _ from 'lodash';

export class MainController {

  constructor($scope, sessionData, $state, $transitions, $timeout, moment) {
    'ngInject';

    this.currentSesstionId = $state.params.sessionId;
    this.$state = $state;
    this.$timeout = $timeout;
    this.moment = moment;

    $transitions.onSuccess({}, transition => {

      this.currentSesstionId = transition.params().sessionId;

    });

    $scope.$on('initialSessions', () => {
      this.sessions = sessionData.findAll();
    });

  }

  secondsToDestroy (session) {

    if(!session.willBeDestroyedAt){
      return;
    }

    this.$timeout(1000);

    return - this.moment().diff(session.willBeDestroyedAt, 'seconds');
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
