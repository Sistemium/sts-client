export function config($logProvider, toastrConfig) {
  'ngInject';
  // Enable log
  $logProvider.debugEnabled(true);

  // Set options third-party lib
  toastrConfig.allowHtml = true;
  toastrConfig.timeOut = 3000;
  toastrConfig.positionClass = 'toast-top-right';
  toastrConfig.preventDuplicates = true;
  toastrConfig.progressBar = true;
}

export function localStorageConfig(localStorageServiceProvider) {
  'ngInject';
  localStorageServiceProvider.setPrefix('junk');
}

const cgBusyDefaults = {
  message: 'Loading ...',
  //backdrop: false,
  //templateUrl: 'my_custom_template.html',
  delay: 100,
  minDuration: 200,
  wrapperClass: 'my-class my-class2'
};

export {cgBusyDefaults};

export function localStorageServiceConfig (localStorageServiceProvider) {
  'ngInject';
  localStorageServiceProvider
    // .setStorageType('sessionStorage')
    // .setNotify(true, true)
    .setPrefix('sts');
}
