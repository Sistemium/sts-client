import modelsConfig from './models.config';


export function runBlock ($log, StsData, $trace, $transitions, auth) {

  'ngInject';
  modelsConfig(StsData);
  $log.debug('sts client start');
  $trace.enable('TRANSITION');
  $transitions.onStart({ }, () => {

    return auth;

  });


}
