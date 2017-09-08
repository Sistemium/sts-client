import {DataStore} from 'js-data';
import _ from 'lodash';

const moment = require('moment');

const debug = require('debug')('sts:socket');  // eslint-disable-line

export class StsData extends DataStore {

  constructor() {

    super();

    _.assign(this, {
      models: {}
    });

    this.on('add', this.onChange, this);

    this.on('afterFindAll', this.onChange, this);

    this.on('change', this.onChange, this);

    this.on('remove', this.onChange, this);

    return this;

  }

  setScope(scope) {
    this.scope = scope;
  }

  onChange(mapperName) {

    let mapper = this.getMapperByName(mapperName);

    if (!mapper) return;

    this.scope.$evalAsync(() => {
      mapper.lastModified = moment().format('x');
    });

  }

  storeBindAll(scope, filter, bind, mapper) {

    scope.$watch(() => {
      return mapper.lastModified;
    }, () => {
      _.set(scope, bind, this.filter(mapper.name, filter));
    });

  }

  defineModel(name, config) {

    const mapperConfig = _.assign({
      schema: {track: true}
    }, config || {});

    const modelMapper = this.defineMapper(name, mapperConfig);

    const model = {
      findAll: (params, options) => this.findAll(name, params, options),
      bindAll: (scope, filter, bind) => this.storeBindAll(scope, filter, bind, modelMapper)
    };

    this.models[name] = model;

    return model;

  }

}
