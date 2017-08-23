import _ from 'lodash';

export class DetailController {

  constructor($state, $rootScope, sessionData, NgTableParams, treeConfig, toastr, $q, $scope) {
    'ngInject';

    let rootScope = $rootScope;
    treeConfig.defaultCollapsed = true;

    this.tableParams = new NgTableParams({}, {
      getData: () => {

        this.session = sessionData.find($state.params.sessionId);

        $scope.UUID = _.get(this.session, "deviceUUID");

        if (_.get(this.session, 'deviceInfo')) {

          _.set(this.session, 'commands', [{
            buttonName: "Full Sync",
            action: () => {

              if (!$scope.UUID) return;

              this.busy = sessionData.fullSync($scope.UUID).then(response => {

                if (response) {

                  toastr.success("Successful sync", "Full Sync");

                } else {

                  toastr.error("Unsuccessful sync", "Full Sync");

                }

              });
            }
          }]);

        }

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

    this.minBuild = build => {

      return Number(_.last(_.get(this.session, "userAgent", "").split('/').slice(0, 2))) >= build;

    };

    this.getFileList = (level = "/", rootNode = {children : {}}) => {

      if (!$scope.UUID) return;

      let getFiles = this.minBuild(344) ? sessionData.getDeviceFilesAtLevel($scope.UUID,level) : sessionData.getDeviceFiles($scope.UUID);

      this.busy = getFiles
        .then(response => {

          let fileMapCallback = (key, value) => {

            let nodeWithChildren = {
              label: _.isObject(value) ? key : key + ": " + value,
              children: !_.isObject(value) ? value : mapKeyValue(value, fileMapCallback),
              loadChildren: _.isEmpty(value) ? () => { return this.getFileList(level + key + "/", nodeWithChildren) } : null
            };

            return nodeWithChildren;
          };

          rootNode.children = mapKeyValue(response, fileMapCallback);

          if (!this.files){
            this.files = rootNode.children;
          }

        });

      return this.busy;

    };

    this.getEntityList = () => {

      this.data = [];

      if (!$scope.UUID) return;

      this.busy = sessionData.getDeviceData($scope.UUID).then(response => {

        this.data = _.map(response, entity => {
          return {
            label:entity.name,
            loadChildren: getEntity
          }
        });

      });

    };

    this.toggle = (toggle, target , node) => {

      if (_.isEmpty(node.children)){

        this.busy = $q.when(node.loadChildren()).then(() =>{
          toggle(target);
        });

      }else{

        toggle(target);

      }

    };

    function getEntity () {

      let entityNode = this;

      if (!$scope.UUID) return;

      return sessionData.getEntityData($scope.UUID, entityNode.label).then(response => {

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

      });

    }

    function mapKeyValue(object, callback) {

      let result = [];

      _.forOwn(object, (value, key) => {

        result.push(callback(key, value));

      });

      return result;

    }

  }

}
