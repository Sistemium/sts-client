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

      this.files = [];

      let UUID = _.get(this.session, "deviceUUID");

      if (!UUID) return;

      this.busy = sessionData.getDeviceFiles(UUID)
        .then(response => {

          let fileMapCallback = (key, value) => {

            return _.isObject(value) ? {
              label: key,
              children: mapKeyValue(value, fileMapCallback)
            } : {label: key + ": " + value}

          };

          this.files = mapKeyValue(response, fileMapCallback);

        });

    };

    this.getDataList = () => {

      this.data = [];

      let UUID = _.get(this.session, "deviceUUID");

      if (!UUID) return;

      this.busy = sessionData.getDeviceData(UUID).then(response => {

        this.data = _.map(response, entity => {
          return {
            label: entity.name
          }
        });

      });

    };

    this.getEntity = entityNode => {

      if (entityNode.lazyLoaded) {
        return;
      }

      let UUID = _.get(this.session, "deviceUUID");

      if (!UUID) return;

      this.busy = sessionData.getEntityData(UUID, entityNode.label).then(response => {

        entityNode.children = _.map(response, object => {
          return {
            label: object.id,
            children: mapKeyValue(object, (key, value) => {
              return {
                label: key + ": " + value
              }
            })
          };
        });

        entityNode.lazyLoaded = true;

      });

    };

    function mapKeyValue(object, callback) {

      let result = [];

      _.forOwn(object, (value, key) => {

        result.push(callback(key, value));

      });

      return result;

    }

  }

}
