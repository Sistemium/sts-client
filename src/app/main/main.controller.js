export class MainController {

  constructor($scope, sessionData, NgTableParams, $state) {
    'ngInject';

    $scope.$on('initialSessions', () => {

      this.tableParams = new NgTableParams({}, {dataset: sessionData.findAll()});

    });

    $scope.$on('receivedSession', () => {

      this.tableParams.reload();

    });

    $scope.$on('destroyedSession', () => {

      this.tableParams.reload();

    });

    this.showDetails = (sessionId) => {

      $state.go('sessions.detail', {sessionId});

    }

  }

}
