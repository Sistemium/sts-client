import _ from 'lodash';

export class DetailController {

  constructor($state, $rootScope, sessionData, NgTableParams, treeConfig) {
    'ngInject';

    let rootScope = $rootScope;
    treeConfig.defaultCollapsed = true;

    this.tableParams = new NgTableParams({}, {
      getData: () => {

        this.session = sessionData.find($state.params.sessionId);

        return this.session;
      }
    });

    rootScope.$on('initialSessions', () => {

      this.tableParams.reload();

      if (!this.session) {
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

    this.isDevice = () => {

      return _.get(this.session, "deviceInfo");

    };

    this.getFileList = () => {

      this.list = [];

      let UUID = _.get(this.session, "deviceUUID");

      if (!UUID) return;

      sessionData.getDeviceFiles(UUID).then(response =>{
        this.list = fileMap(response);
      });

    };

    function fileMap(object) {

      let result = [];

      _.forOwn(object,(value,key)=>{

        result.push({
          label:key,
          children:_.isObject(value) ? fileMap(value) : [{
            label:value
          }]
        });

      });

      return result;

    }

  }

}
