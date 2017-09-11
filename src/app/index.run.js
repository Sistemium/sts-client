import modelsConfig from './models.config';


export function runBlock ($log, StsData, $transitions, Auth, $state) {

  'ngInject';
  modelsConfig(StsData);
  $log.debug('sts client start');
  $transitions.onStart({ }, (trans) => {

    if (trans.to().name !== 'login'){
      if (!Auth.getAuthorizationState()){
        return Auth.authorize().catch(() => {
          $state.go('login');
        });
      }
      return Auth.getAuthorizationState();

    }

  });


}
