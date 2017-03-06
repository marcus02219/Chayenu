angular.module('app.controllers')
    .controller('parshaWeeklyOverviewCtrl', function($scope, $ionicScrollDelegate, $location, TextService, $rootScope, ApiService, $ionicLoading, $filter, ionicDatePicker, ParshaService, $ionicHistory) {
        
        $scope.disable_days = [];
        $scope.set_date = true;
        $scope.loaded = false;
        var parsha_id     = 1;
        var section_id    = window.localStorage['last_section_id'];
        $scope.section = window.localStorage['last_section_title'];
        $scope.sectionColor = window.localStorage['last_section_color'];
        $scope.sectionCopyright = window.localStorage['last_section_copyright'];
        $scope.sectionCopyright_text = $scope.sectionCopyright.split("||")[1];
        $scope.isChangingDateEvent = false;
                
        var selectedSectionType = window.localStorage['selected_default_section_type'];
        var selectedDateType    = window.localStorage['selected_default_date_type'];

                
        var cur_date         = new Date();
        cur_date             = cur_date.addDays(0 - cur_date.getDay());
        $scope.date          = window.localStorage["section_" + section_id] || cur_date.format("dddd, mmm, d, yyyy");
                
        if(selectedDateType != "left_off"){
            $scope.date = cur_date.format("dddd, mmm, d, yyyy");
        }

        $scope.selected_date = new Date($scope.date);

        if(selectedSectionType != "left_off"){
                var section_id          = window.localStorage['selected_default_section']
                $scope.section          = window.localStorage['selected_default_section_label']
                $scope.sectionColor     = window.localStorage['selected_default_section_color']
        }
console.log('aaaa'+$scope.date)
console.log('bbbb'+$scope.selected_date)
        $scope.weekly_index = parseInt(window.localStorage["section_weekly_index_" + section_id]) || 0;
        

        window.localStorage['parsha_id'] = 1;
        window.localStorage['last_section_weekly'] = 1;

        $scope.parsha_title = $rootScope["section_" + section_id + "_selected_parsha_title"];
        $scope.sttButton = false;
        $scope.disable_days = [];
        $scope.weekly_index = parseInt(window.localStorage["section_weekly_index_" + section_id]) || 0;
        $scope.parsha_title = $rootScope["section_" + section_id + "_selected_parsha_title"];
        

      $scope.$on('syncing-complete', function(event, args) {
          bindTextData();
      });
      $scope.showDatePicker = function() {
          var selected_date = angular.copy($scope.selected_date);

          var ipObj1 = {
              callback: function(val) { //Mandatory
                  console.log('Return value from the datepicker popup is : ' + val, new Date(val));
                  var selected_dt = new Date(val);
                  selected_dt = selected_dt.addDays(0 - selected_dt.getDay());
                  $scope.selected_date = angular.copy(selected_dt);
                  var date = selected_dt.format("dddd, mmm, d, yyyy");
                  window.localStorage["section_" + section_id] = date;
                  $scope.date = date;
                  $rootScope["section_" + section_id + "_selected_date"] = selected_dt.format("dddd, mmm, d, yyyy");

                  bindTextData();
              },
              selectedDateCallback: function(val) {
                  console.log('select date : ' + val, new Date(val));
                  setTimeout(function() {
                      $(".padding_zero").each(function() {
                          $(this).removeClass('available-week');
                      });
                      $(".selected_date").parent().addClass("available-week");
                  }, 500);
              },
              isDaily: false,
              dateFormat: 'MMMM dd, yyyy',
              from: $rootScope.st_date, //Optional
              to: $rootScope.ed_date, //Optional
              disabledDates: $scope.disable_days,
              inputDate: selected_date, //Optional
              mondayFirst: false, //Optional
              closeOnSelect: false, //Optional
              templateType: 'popup' //Optional
          };
          ionicDatePicker.openDatePicker(ipObj1);
          setTimeout(function() {
              $(".padding_zero").each(function() {
                  $(this).removeClass('available-week');
              });
              $(".selected_date").parent().addClass("available-week");
          }, 500);
      };

      $scope.scrollToTop = function() { //ng-click for back to top button
          $ionicScrollDelegate.scrollTop(true);
          $scope.sttButton = false; //hide the button when reached top
      };

      $ionicHistory.nextViewOptions({
          disableBack: true
      });
      $scope.openCopyright = function() {
          var html = $scope.sectionCopyright;
          var link = html.split('||')[0];
          window.open(link, '_blank');
      };


      var cur_poss = 0;
      var last_poss = 0;
      var top = 0;
      var opacity = 1;
      var content_top = 76;
      $scope.scrollEvent = function() {
          $scope.scrollamount = $ionicScrollDelegate.$getByHandle('scrollHandle').getScrollPosition().top;
          cur_poss = $scope.scrollamount;
          if (cur_poss <= 1) {
              top = 0;
              opacity = 1;
              content_top = 76;
              $scope.$apply(function() {
                  $scope.hideNavigation = false;
              });
              $(".bar-positive").css("top", 0);
              $(".bar-positive").css("opacity", opacity);
              $(".has-header").css("top", content_top);
              return false;
          }

          if (cur_poss - last_poss > 10) {
              last_poss = cur_poss - 1;
          }

          if (last_poss - cur_poss > 10) {
              last_poss = cur_poss + 1;
          }

          if (last_poss > cur_poss) {
              if (content_top > 76) {
                  console.log(content_top)
              } else {
                  content_top = content_top + 2;
                  $(".has-header").css("top", content_top);
              }
              if (top >= -2) {
                  console.log(top)
              } else {
                  top = top + 2;
                  if (opacity <= 1) {
                      opacity = opacity + 0.02
                  }
                  $(".bar-positive").css("top", top);
                  $(".bar-positive").css("opacity", opacity);
              }

          } else {
              if (content_top < 0) {
                  console.log(content_top)
              } else {
                  content_top = content_top - 2;
                  $(".has-header").css("top", content_top);
              }

              if (top < -80) {
                  console.log(top)
              } else {
                  top = top - 2;
                  if (opacity >= 0) {
                      opacity = opacity - 0.02
                  }
                  $(".bar-positive").css("top", top);
                  $(".bar-positive").css("opacity", opacity);
              }
          }

      };

      $scope.showPrevData = function() {
          $scope.isChangingDateEvent = true;
          if ($scope.weekly_index == 0) {
              return false;
          }
          //        $scope.selected_date.setDate($scope.selected_date.getDate()-1);
          $scope.weekly_index = $scope.weekly_index - 1
          $scope.selected_date = $scope.parsha_days[$scope.weekly_index][0]
          $scope.selected_date.setDate($scope.selected_date.getDate() + DATE_OFFSET)
          var date = $scope.selected_date.format("dddd, mmm, d, yyyy");
          window.localStorage["section_" + section_id] = date;
          $scope.date = date;
          $rootScope["section_" + section_id + "_selected_date"] = date;
          bindTextData();
          window.localStorage["section_weekly_index_" + section_id] = $scope.weekly_index;
      }
      $scope.showNextData = function() {
          $scope.isChangingDateEvent = true;
          if ($scope.weekly_index == $scope.parsha_days.length - 1) {
              return false;
          }
          $scope.weekly_index = $scope.weekly_index + 1
          $scope.selected_date = $scope.parsha_days[$scope.weekly_index][0]
          $scope.selected_date.setDate($scope.selected_date.getDate() + DATE_OFFSET)
          var date = $scope.selected_date.format("dddd, mmm, d, yyyy");
          window.localStorage["section_" + section_id] = date;
          $scope.date = date;
          $rootScope["section_" + section_id + "_selected_date"] = date;
          bindTextData();
          window.localStorage["section_weekly_index_" + section_id] = $scope.weekly_index;
      }

      bindTextData();

      function bindTextData() {
          $ionicScrollDelegate.scrollTop(true);
          $scope.sttButton = false;
          $scope.loaded = false;
          $ionicLoading.show({
              template: '<ion-spinner icon="ios"></ion-spinner>'
          });
          var parsha_id = 0;
          var selected_dt = $scope.selected_date;
            if(window.localStorage['default_section_copyright'] == undefined){
                $scope.sectionCopyright = $scope.sectionData[0].copyright;
                $scope.sectionCopyright_text = $scope.sectionData[0].copyright.split("||")[1];
                window.localStorage['last_section_copyright'] = $scope.sectionData[0].copyright;
            }else{
                $scope.sectionCopyright = window.localStorage['default_section_copyright'];
                $scope.sectionCopyright_text = $scope.sectionCopyright.split("||")[1];
                window.localStorage['last_section_copyright'] = window.localStorage['default_section_copyright'];
            }
          $scope.parsha_days = [];
console.log('selected_dt---->'+selected_dt);
          ParshaService.getData(selected_dt)
              .then(function(result) {
                  stdt = new Date(result[0].start_date);
                  eddt = new Date(result[0].end_date);
                  console.log('stdt----->' + stdt);
                  console.log('eddt----->' + eddt);
                  $rootScope.st_date = stdt;
                  $rootScope.ed_date = eddt;
                  for (var i = 0; i < result.length; i++) {
                      parsha = result[i];
                      stdt = new Date(parsha.start_date);
                      eddt = new Date(parsha.end_date);
                      $rootScope.st_date = $rootScope.st_date > stdt ? stdt : $rootScope.st_date;
                      $rootScope.ed_date = $rootScope.ed_date < eddt ? eddt : $rootScope.ed_date;
                      $scope.parsha_days.push([stdt, eddt]);

                      var temp_stdt = angular.copy(stdt);
                      temp_stdt.setDate(temp_stdt.getDate() + DATE_OFFSET);

                      var temp_eddt = angular.copy(eddt);
                      temp_eddt.setDate(temp_eddt.getDate() + DATE_OFFSET);
                      selected_dt.setHours(temp_stdt.getHours());
                      if (temp_eddt >= selected_dt && selected_dt >= temp_stdt) {
                          parsha_id = parsha.ID;
                          $scope.parsha_title = parsha.text_eng;
                          $rootScope["section_" + section_id + "_selected_parsha_title"] = parsha.text_eng;
                          window.localStorage["section_" + section_id + "_selected_parsha_title"] = parsha.text_eng;
                          $scope.weekly_index = i; /* added 2016-11-16*/
                          $rootScope.daily_parsha_title = $scope.parsha_title;
                          console.log('weekly_index ->' + $scope.weekly_index);
                      }

                  }
                  if (parsha_id == 0) {
                      parsha_id = result[0].ID;
                      $scope.parsha_title = result[0].text_eng;
                      $rootScope["section_" + section_id + "_selected_parsha_title"] = result[0].text_eng;
                      window.localStorage["section_" + section_id + "_selected_parsha_title"] = result[0].text_eng;
                  }

                  var tmp_root_st_dt = angular.copy($rootScope.st_date);
                  $rootScope.st_date.setDate(tmp_root_st_dt.getDate() + DATE_OFFSET);

                  var tmp_root_ed_dt = angular.copy($rootScope.ed_date);
                  $rootScope.ed_date.setDate(tmp_root_ed_dt.getDate() + DATE_OFFSET);

                  var available_date = angular.copy($rootScope.st_date);
                  available_date.setHours(0);
                  var available = false;
                  var disable_days = [];

                  while (available_date < $rootScope.ed_date) {
                      for (i = 0; i < $scope.parsha_days.length; i++) {
                          day_item = angular.copy($scope.parsha_days[i]);
                          day_item[1].setDate(day_item[1].getDate() + DATE_OFFSET);
                          day_item[1].setHours(0);
                          day_item[0].setDate(day_item[0].getDate() + DATE_OFFSET);
                          day_item[0].setHours(0);
                          if (day_item[1] >= available_date && available_date >= day_item[0]) {
                              available = true;
                              break;
                          }
                      }

                      if (available == false && available_date != $rootScope.st_date && available_date != $rootScope.ed_date) {
                          disable_days.push(angular.copy(available_date));
                      }
                      available = false;
                      available_date.setDate(available_date.getDate() + 1);
                  }
                  $scope.disable_days = disable_days;

                  /* added 2016-11-16 */
                  if ($scope.set_date == false) {
                      $scope.set_date = true;

                      console.log('$scope_weekly_index->' + $scope.weekly_index);

                      $scope.selected_date = $scope.parsha_days[$scope.weekly_index][0];
                      $scope.selected_date.setDate($scope.selected_date.getDate() + 1);
                      var date = $scope.selected_date.toDateString().slice(4, 15);
                      date = date.replace(date.substr(4, 2), $scope.selected_date.getDate() + ",");
                      window.localStorage["section_" + section_id] = date;
                      $scope.date = date;
                      selected_dt = new Date($scope.date);
                      console.log('sest_false_scope_date->' + $scope.date);
                  }
                  console.log('parsha_id->' + parsha_id);
                  console.log('section_id->' + section_id);
                  console.log('scope_date->' + $scope.date);
                  /* end 2016-11-16 */

                  TextService.getData(parsha_id, section_id, $scope.date).then(function(result) {
                      $scope.textData = result;
                      $ionicLoading.hide();
                       if(result.length > 0){
                           $scope.loaded = true;
                       }else{
                           $scope.loaded = false;
                       }

                  });
              });

      }
    })
