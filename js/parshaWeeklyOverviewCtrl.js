angular.module('app.controllers')
    .controller('parshaWeeklyOverviewCtrl', function($scope, $ionicScrollDelegate, $location, TextService, $rootScope, ApiService, $ionicLoading, $filter, ionicDatePicker, ParshaService, $ionicHistory) {
        var parsha_id = +window.localStorage['parsha_id'];
        var section_id = window.localStorage['last_section_id'];
        $scope.sttButton = false;
        $scope.loaded = false;
        $scope.date = window.localStorage["section_" + section_id];
        $scope.disable_days = [];
        $scope.weekly_index = parseInt(window.localStorage["section_weekly_index_" + section_id]) || 0;
        $scope.selected_date = new Date($scope.date);
        $scope.parsha_title = $rootScope["section_" + section_id + "_selected_parsha_title"];
        $scope.section = window.localStorage['last_section_title'];
        $scope.sectionColor = window.localStorage['last_section_color'];

        $scope.$on('syncing-complete', function(event, args) {
            bindTextData();
        });
        $scope.scrollToTop = function() { //ng-click for back to top button
            $ionicScrollDelegate.scrollTop(true);
            $scope.sttButton = false; //hide the button when reached top
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

            //        var moveData = $scope.scrollamount;
            //        $scope.$apply(function(){
            //            if(moveData>300){
            //                $scope.sttButton=true;
            //            }else{
            //                $scope.sttButton=false;
            //            }
            //        }); //apply
        };

        $scope.showPrevData = function() {
            if ($scope.weekly_index == 0) {
                return false;
            }
            //        $scope.selected_date.setDate($scope.selected_date.getDate()-1);
            $scope.weekly_index = $scope.weekly_index - 1
            $scope.selected_date = $scope.parsha_days[$scope.weekly_index][0]
            $scope.selected_date.setDate($scope.selected_date.getDate() + 1)
            var date = $scope.selected_date.toDateString().slice(4, 15);
            date = date.replace(date.substr(4, 2), $scope.selected_date.getDate() + ",");
            window.localStorage["section_" + section_id] = date;
            $scope.date = date;
            $rootScope["section_" + section_id + "_selected_date"] = date;
            bindTextData();
            window.localStorage["section_weekly_index_" + section_id] = $scope.weekly_index;
        }

        $scope.showNextData = function() {
            if ($scope.weekly_index == $scope.parsha_days.length - 1) {
                return false;
            }
            $scope.weekly_index = $scope.weekly_index + 1
            $scope.selected_date = $scope.parsha_days[$scope.weekly_index][0]
            $scope.selected_date.setDate($scope.selected_date.getDate() + 1)
            var date = $scope.selected_date.toDateString().slice(4, 15);
            date = date.replace(date.substr(4, 2), $scope.selected_date.getDate() + ",");
            window.localStorage["section_" + section_id] = date;
            $scope.date = date;
            $rootScope["section_" + section_id + "_selected_date"] = date;
            bindTextData();
            window.localStorage["section_weekly_index_" + section_id] = $scope.weekly_index;
        }
        $scope.showDatePicker = function() {
            var selected_date = angular.copy($scope.selected_date);

            var ipObj1 = {
                callback: function(val) { //Mandatory
                    var selected_dt = new Date(val);
                    selected_dt = selected_dt.addDays(0 - selected_dt.getDay());
                    $scope.selected_date = angular.copy(selected_dt);
                    var date = selected_dt.format("dddd, mmm, d, yyyy");
                    window.localStorage["section_" + section_id] = date;
                    $scope.date = date;
                    $rootScope["section_" + section_id + "_selected_date"] = selected_dt.format("dddd, mmm, d, yyyy");
                    console.log('Return value from the datepicker popup is : ' + val, new Date(val));
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
            $scope.parsha_days = [];

            ParshaService.getData(selected_dt)
                .then(function(result) {
                    stdt = new Date(result[0].start_date);
                    eddt = new Date(result[0].end_date);
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
                            $rootScope.default_parsha_title = parsha.text_eng;
                        }

                    }
                    if (parsha_id == 0) {
                        parsha_id = result[0].ID;
                        $scope.parsha_title = result[0].text_eng;
                        $scope.selected_date = new Date(result[0].start_date);
                        $scope.selected_date.setDate($scope.selected_date.getDate() + DATE_OFFSET)
                        var date = $scope.selected_date.toDateString().slice(4, 15);
                        date = date.replace(date.substr(4, 2), $scope.selected_date.getDate() + ",");
                        $scope.date = date;
                        $rootScope["section_" + section_id + "_selected_parsha_title"] = result[0].text_eng;
                        window.localStorage["section_" + section_id + "_selected_parsha_title"] = result[0].text_eng;
                        $rootScope.default_parsha_title = result[0].text_eng;
                    }
                    var tmp_root_st_dt = angular.copy($rootScope.st_date);
                    $rootScope.st_date.setDate(tmp_root_st_dt.getDate() + DATE_OFFSET);

                    var tmp_root_ed_dt = angular.copy($rootScope.ed_date);
                    $rootScope.ed_date.setDate(tmp_root_ed_dt.getDate() + DATE_OFFSET);

                    var available_date = angular.copy($rootScope.st_date)
                    var available = false;
                    var disable_days = [];

                    while (available_date < $rootScope.ed_date) {
                        for (i = 0; i < $scope.parsha_days.length; i++) {
                            day_item = angular.copy($scope.parsha_days[i]);
                            day_item[1].setDate(day_item[1].getDate() + DATE_OFFSET);
                            day_item[0].setDate(day_item[0].getDate() + DATE_OFFSET);
                            if (day_item[1] >= available_date && available_date >= day_item[0]) {
                                available = true;
                                break;
                            }
                        }

                        if (available == false) {
                            disable_days.push(angular.copy(available_date));
                        }
                        available = false;
                        available_date.setDate(available_date.getDate() + 1);
                    }
                    $scope.disable_days = disable_days;
                    TextService.getData(parsha_id, section_id, $scope.date).then(function(result) {
                        $scope.textData = result;
                        $ionicLoading.hide();
                        $scope.loaded = true;
                    });
                });

        }
    })
