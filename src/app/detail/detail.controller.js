import _ from 'lodash';

export class DetailController {

  constructor($state, $rootScope, sessionData, NgTableParams) {
    'ngInject';

    let rootScope = $rootScope;

    this.tableParams = new NgTableParams({}, {
      getData: () => {

        let session = sessionData.find($state.params.sessionId);

        return _.toPairs(session)
      }
    });

    rootScope.$on('initialSessions', () => {

      this.tableParams.reload();

      let session = sessionData.find($state.params.sessionId);

      if (!session) {
        this.goBack();
      }

    });

    rootScope.$on('receivedSession', () => {

      this.tableParams.reload();

    });

    rootScope.$on('destroyedSession', () => {

      this.tableParams.reload();

    });

    this.goBack = () => {
      $state.go('^');
    };

    this.presentObject = (param) => {
      return _.isObject(param);
    };

  }

}
