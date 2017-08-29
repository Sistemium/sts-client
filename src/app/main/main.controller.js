import _ from 'lodash';

export class MainController {

  constructor($scope, sessionData, NgTableParams, $state, $transitions) {
    'ngInject';

    this.currentSesstionId = $state.params.sessionId;

    $transitions.onSuccess({ }, trans => {

      let $state = trans.router.stateService;

      this.currentSesstionId = $state.params.sessionId;

    });

    $scope.$on('initialSessions', () => {

      this.tableParams = new NgTableParams({}, {getData: sessionData.findAll});

    });

    $scope.$on('receivedSession', () => {

      this.tableParams.reload();

    });

    $scope.$on('destroyedSession', () => {

      this.tableParams.reload();

    });

    this.showDetails = sessionId => {

      $state.go('sessions.detail', {sessionId});

    };

    this.split = function (string) {
      return _.first(string.split(' '));
    };

  }

}
