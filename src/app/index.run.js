import modelsConfig from './models.config';

export function runBlock ($log, stsData) {
  'ngInject';

  $log.debug('sts client start');
  modelsConfig(stsData);

}
