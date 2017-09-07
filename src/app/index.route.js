export function routerConfig ($stateProvider, $urlRouterProvider) {
  'ngInject';

  $stateProvider
    .state('authorization', {
      url: '/authorization',
      templateUrl: 'app/auth/auth.html',
      controller: 'AuthController',
      controllerAs: 'vm'
    })
    .state('sessions', {
      url: '/sessions',
      templateUrl: 'app/main/main.html',
      controller: 'MainController',
      controllerAs: 'vm'
    })
    .state('sessions.detail', {
      url: '/:sessionId',
      templateUrl: 'app/detail/detail.html',
      controller: 'DetailController',
      controllerAs: 'vm'
    });

  $urlRouterProvider.otherwise('/authorization');
}
