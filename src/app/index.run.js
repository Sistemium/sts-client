import modelsConfig from './models.config';


export function runBlock ($log, StsData, $transitions, Auth) {

  'ngInject';
  modelsConfig(StsData);
  $log.debug('sts client start');
  $transitions.onStart({ }, () => {

    return Auth;

  });


}
