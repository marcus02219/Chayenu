angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
  .state('menu', {
    url: '/side-menu21',
    templateUrl: 'templates/menu.html',
    controller: 'MenuCtrl',
    abstract:true
  })

  .state('menu.parshaOverviewMaasei', {
    url: '/overview',
    views: {
      'side-menu21': {
        templateUrl: 'templates/parshaOverviewMaasei.html',
        controller: 'parshaOverviewMaaseiCtrl'
      }
    }
  })
  .state('menu.parshaWeeklyOverview', {
   url: '/weeklyOverview',
       views: {
       'side-menu21': {
           templateUrl: 'templates/weeklyOverview.html',
           controller: 'parshaWeeklyOverviewCtrl'
       }
       }
   })

  .state('menu.chumashJune102016', {
    url: '/daily_study/:section_name/:section_copyright/:section_color/:section_id/:day?',
    views: {
      'side-menu21': {
        templateUrl: 'templates/chumashJune102016.html',
        controller: 'DailyStudyController',
        reloadOnSearch: true
      }
    }
  })

  .state('menu.tanyaJune102016', {
    url: '/tanya',
    views: {
      'side-menu21': {
        templateUrl: 'templates/tanyaJune102016.html',
        controller: 'tanyaJune102016Ctrl'
      }
    }
  })

  .state('menu.hayomYomJune102016', {
    url: '/hayom',
    views: {
      'side-menu21': {
        templateUrl: 'templates/hayomYomJune102016.html',
        controller: 'hayomYomJune102016Ctrl'
      }
    }
  })

  .state('menu.rambamJune102016', {
    url: '/rambam',
    views: {
      'side-menu21': {
        templateUrl: 'templates/rambamJune102016.html',
        controller: 'rambamJune102016Ctrl'
      }
    }
  })
    .state('menu.setting', {
        url: '/setting',
        views: {
            'side-menu21': {
                templateUrl: 'templates/setting.html',
                controller: 'settingCtrl'
            }
        }
    })
    .state('menu.font_size', {
        url: '/setting',
        views: {
        'side-menu21': {
            templateUrl: 'templates/fontSize.html',
            controller: 'settingCtrl'
        }
        }
    })
    .state('menu.about', {
       url: '/about',
       views: {
           'side-menu21': {
               templateUrl: 'templates/about.html',
               controller: 'aboutCtrl'
           }
       }
   })
    .state('menu.default_settings', {
        url: '/default_settings',
        views: {
            'side-menu21': {
                templateUrl: 'templates/default_settings.html',
                controller: 'defaultSettingsCtrl'
            }
        }
    })
    .state('menu.weekly', {
       url: '/weekly/:section_name/:section_copyright/:section_color/:section_id/:day?',
         views: {
           'side-menu21': {
           templateUrl: 'templates/weekly.html',
           controller: 'WeeklyStudyController'
         }
       }
   });
    $urlRouterProvider.otherwise('/side-menu21/overview')

});