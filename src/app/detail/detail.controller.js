import _ from 'lodash';

const debug = require('debug')('sts:socket'); // eslint-disable-line

export class DetailController {

  constructor($state, $rootScope, SessionCommands, NgTableParams, treeConfig, toastr, $q, $scope, $timeout, StsData) {
    'ngInject';

    this.$state = $state;
    this.$scope = $scope;
    this.$q = $q;
    this.dataStore = StsData;
    this.$timeout = $timeout;

    let rootScope = $rootScope;
    treeConfig.defaultCollapsed = true;

    this.session = this.dataStore.get('session', $state.params.sessionId);

    $scope.UUID = _.get(this.session, "deviceUUID");

    if (_.get(this.session, 'deviceInfo')) {

      _.set(this.session, 'commands', [{
        buttonName: "Full Sync",
        action: () => {

          if (!$scope.UUID) return;

          return SessionCommands.fullSync($scope.UUID)
            .then(response => {

              if (response) {

                toastr.success("Successful sync", "Full Sync");

              } else {

                toastr.error("Unsuccessful sync", "Full Sync");

              }

            }).catch(error => {

              toastr.error("Unsuccessful sync - " + error, "Full Sync");

            });
        }
      }]);

    }

    rootScope.$on('initialSessions', () => {

      if (!this.session) {
        this.goBack();
      }

    });

    this.entityParams = new NgTableParams({}, {
      getData: params => {

        if (!this.entities) {
          this.entities = [];
        }

        if (!this.selectedEntity) {
          this.selectedEntity = '';
          return;
        }

        if (!this.$scope.UUID) return;

        let promise = this.dataStore.count('entity',{
          entityName:this.selectedEntity,
          deviceUUID: this.$scope.UUID
        }).then(total => {

          params.total(total);

          return this.dataStore.findAll('entity', {
              deviceUUID: this.$scope.UUID,
              entityName: this.selectedEntity,
              pageSize: params.count(),
              startPage: params.page()
            },
            {force: true}
          );

        }).then(response => {
          this.entities[this.selectedEntity] = response;
          return response;
        });

        this.busy = promise;

        return promise;

      }
    });

  }

  goBack() {
    this.$state.go('^');
  }

  presentObject(param) {
    return _.isObject(param);
  }

  minBuild(build) {

    return Number(_.last(_.get(this.session, "userAgent", "").split('/').slice(0, 2))) >= build;

  }

  getFileList(level = "/", rootNode = {children: {}}) {

    if (!this.$scope.UUID) return;

    if (level == "/" && this.files) return;

    let getFiles = this.minBuild(344) ? this.dataStore.findAll('deviceFile', {
      deviceUUID: this.$scope.UUID,
      level
    }, {force:true}) : this.dataStore.findAll('deviceFile', {deviceUUID: this.$scope.UUID}, {force:true});

    this.busy = getFiles
      .then(response => {

        let fileMapCallback = (key, value) => {

          let nodeWithChildren = {
            label: _.isObject(value) ? key : key + ": " + value,
            children: !_.isObject(value) ? undefined : this.mapKeyValue(value, fileMapCallback),
            loadChildren: _.isEmpty(value) ? () => {
              return this.getFileList(level + key + "/", nodeWithChildren)
            } : null
          };

          return nodeWithChildren;
        };

        rootNode.children = this.mapKeyValue(response, fileMapCallback);

        if (!this.files) {
          this.files = rootNode.children;

          this.$timeout(() => {
            this.$scope.$apply();
          })
        }

      });

    return this.busy;

  }

  getEntityList() {

    if (this.entityList) {
      return;
    }

    this.entityList = [];

    if (!this.$scope.UUID) return;

    this.busy = this.dataStore.findAll('entity', {
      deviceUUID: this.$scope.UUID,
      entityName: 'Entity'
    }, {force:true}).then(response => {

      this.entityList = response;

      this.$timeout(() => {
        this.$scope.$apply();
      })

    });

  }

  toggle(toggle, target, node) {

    if (_.isEmpty(node.children)) {

      this.busy = this.$q.when(node.loadChildren()).then(() => {
        toggle(target);
      });

    } else {

      toggle(target);

    }

  }

  mapKeyValue(object, callback) {

    let result = [];

    _.forOwn(object, (value, key) => {

      result.push(callback(key, value));

    });

    return result;

  }

  getEntity(name) {

    this.selectedEntity = name;

    this.entityParams.reload();

  }

}
