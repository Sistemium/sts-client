import _ from 'lodash';
const debug = require('debug')('sts:socket'); // eslint-disable-line

export class DetailController {

  constructor($state, $rootScope, sessionCommands, NgTableParams, treeConfig, toastr, $q, $scope, stsData, $timeout) {
    'ngInject';

    this.$state = $state;
    this.$scope = $scope;
    this.$q = $q;
    this.stsData = stsData;
    this.$timeout = $timeout;

    let rootScope = $rootScope;
    treeConfig.defaultCollapsed = true;

    this.session = stsData.get('session', $state.params.sessionId);
    $scope.UUID = _.get(this.session, "deviceUUID");

    if (_.get(this.session, 'deviceInfo')) {

      _.set(this.session, 'commands', [{
        buttonName: "Full Sync",
        action: () => {

          if (!$scope.UUID) return;

          return sessionCommands.fullSync($scope.UUID)
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

        params.total(_.keys(this.entities[this.selectedEntity]).length);

        return this.entities[this.selectedEntity].slice((params.page() - 1) * params.count(), params.page() * params.count());

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

    let getFiles = this.minBuild(344) ? this.stsData.findAll('deviceFile', {
      deviceUUID: this.$scope.UUID,
      level
    }) : this.stsData.findAll('deviceFile', {deviceUUID: this.$scope.UUID});

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

    this.busy = this.stsData.findAll('entity', {
        deviceUUID: this.$scope.UUID,
        entityName: 'Entity'
      }).then(response => {

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

    if (this.entities[name]) {
      return;
    }

    if (!this.$scope.UUID) return;

    this.busy = this.stsData.findAll('entity', {
      deviceUUID: this.$scope.UUID,
      entityName: name
    },
      {force:true}
      ).then(response => {

      this.entities[name] = response;

      this.entityParams.reload()

    });

  }

}
