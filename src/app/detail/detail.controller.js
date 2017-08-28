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

              return sessionData.fullSync($scope.UUID)
                .then(response => {

                  if (response) {

                    toastr.success("Successful sync", "Full Sync");

                  } else {

                    toastr.error("Unsuccessful sync", "Full Sync");

                  }

                }).catch(error => {

                  toastr.error("Unsuccessful sync - "+error, "Full Sync");

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

    this.getFileList = (level = "/", rootNode = {children: {}}) => {

      if (!$scope.UUID) return;

      if (level == "/" && this.files) return;

      let getFiles = this.minBuild(344) ? sessionData.getDeviceFilesAtLevel($scope.UUID, level) : sessionData.getDeviceFiles($scope.UUID);

      this.busy = getFiles
        .then(response => {

          let fileMapCallback = (key, value) => {

            let nodeWithChildren = {
              label: _.isObject(value) ? key : key + ": " + value,
              children: !_.isObject(value) ? undefined : mapKeyValue(value, fileMapCallback),
              loadChildren: _.isEmpty(value) ? () => {
                return this.getFileList(level + key + "/", nodeWithChildren)
              } : null
            };

            return nodeWithChildren;
          };

          rootNode.children = mapKeyValue(response, fileMapCallback);

          if (!this.files) {
            this.files = rootNode.children;
          }

        });

      return this.busy;

    };

    this.getEntityList = () => {

      if (this.entityList){
        return;
      }

      this.entityList = [];

      if (!$scope.UUID) return;

      this.busy = sessionData.getDeviceData($scope.UUID).then(response => {

        this.entityList = response;

      });

    };

    this.toggle = (toggle, target, node) => {

      if (_.isEmpty(node.children)) {

        this.busy = $q.when(node.loadChildren()).then(() => {
          toggle(target);
        });

      } else {

        toggle(target);

      }

    };

    this.entityParams = new NgTableParams({}, {
      getData: params => {

        if (!this.entities){
          this.entities = [];
        }

        if (!this.selectedEntity){
          this.selectedEntity = "";
        }

        params.total(_.keys(this.entities[this.selectedEntity]).length);

        return this.entities[this.selectedEntity].slice((params.page() - 1) * params.count(), params.page() * params.count());

      }
    });

    this.getEntity = name => {

      this.selectedEntity = name;

      if (this.entities[name]){
        return;
      }

      if (!$scope.UUID) return;

      this.busy = sessionData.getEntityData($scope.UUID, name).then(response => {

        this.entities[name] = response;

        this.entityParams.reload()

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
