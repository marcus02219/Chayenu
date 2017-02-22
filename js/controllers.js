angular.module('app.controllers', ['ionic', 'data.sync', 'db_starter', 'ngSanitize', 'ionic-datepicker'])
    .controller('chumashJune102016Ctrl', function($scope) {})

    .controller('tanyaJune102016Ctrl', function($scope) {})

    .controller('hayomYomJune102016Ctrl', function($scope) {})

    .controller('DailyStudyController', function($scope, $ionicScrollDelegate, $location, TextService, $stateParams, $rootScope, ApiService, $ionicLoading, $filter, ionicDatePicker, ParshaService, $ionicHistory) {
        $scope.date = window.localStorage["section_" + $stateParams['section_id']];
        var selectedDateType = window.localStorage['selected_default_date_type'];

        if (selectedDateType == "today") {
            var today_dt = new Date();
            $scope.date = today_dt.format("dddd, mmm, d'th', yyyy");
        }

        $scope.disable_days = [];
        $scope.sttButton = false;
        if ($stateParams['day'] && $scope.date === undefined) {
            $scope.date = $stateParams['day']
        }
        var mini_date = new Date(MIN_DATE);
        $scope.selected_date = new Date($scope.date.replace('th,', ','));

        if ($scope.selected_date < mini_date) {
            $scope.selected_date = mini_date;
            date = mini_date.toDateString().slice(4, 15);
            $scope.date = date.replace(date.substr(4, 2), $scope.selected_date.getDate() + ",");

        }

        window.localStorage['parsha_id'] = 1;

        window.localStorage['last_section_id'] = $stateParams['section_id'];
        window.localStorage['last_section_title'] = $stateParams['section_name'];
        window.localStorage['last_section_weekly'] = 0;
        window.localStorage['last_section_color'] = $stateParams['section_color'];
        window.localStorage['last_section_copyright'] = $stateParams['section_copyright'];
                console.log("------------->"+window.localStorage['last_section_copyright']);
        $scope.section = $stateParams['section_name'];
        $scope.sectionColor = $stateParams['section_color'];
        $scope.sectionCopyright = window.localStorage['last_section_copyright'];
        $scope.sectionCopyright_text = $scope.sectionCopyright.split("||")[1];
                
        var parsha_id = +window.localStorage['parsha_id'];
        var section_id = +$stateParams['section_id'];

        $scope.scrollToTop = function() { //ng-click for back to top button
            $ionicScrollDelegate.scrollTop(true);
            $scope.sttButton = false; //hide the button when reached top
        };

        $ionicHistory.nextViewOptions({
            disableBack: true
        });

        $scope.openCopyright = function() {
            var html = $scope.sectionCopyright;
            //        var link = html.split('=')[1].split('>')[0].split('"')[1]
            var link = html.split('||')[0];
            window.open(link, '_blank');
        };

        $scope.showDatePicker = function() {
            var selected_date = angular.copy($scope.selected_date);

            var ipObj1 = {
                callback: function(val) { //Mandatory
                    console.log('Return value from the datepicker popup is : ' + val, new Date(val));
                    var selected_dt = new Date(val)
                    $scope.selected_date = angular.copy(selected_dt);
                    var date = selected_dt.format("dddd, mmm, d'th', yyyy");
                    window.localStorage["section_" + $stateParams['section_id']] = date;
                    $scope.date = date;
                    $rootScope["section_" + $stateParams['section_id'] + "_selected_date"] = selected_dt.format("dddd, mmm, d, yyyy");

                    bindTextData();
                },
                selectedDateCallback: function(val) {
                    console.log('select date : ' + val, new Date(val));
                },
                isDaily: true,
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
        };

        $scope.$on('syncing-complete', function(event, args) {
            bindTextData();
        });
        var cur_poss = 0;
        var last_poss = 0;
        var top = 0;
        var opacity = 1;
        var content_top = 76;
        $scope.scrollEvent = function() {
            $(".bar-positive").eq(1).hide();
            $scope.scrollamount = $ionicScrollDelegate.$getByHandle('scrollHandle').getScrollPosition().top;
            cur_poss = $scope.scrollamount;
            if (cur_poss == 0 || cur_poss < 1) {
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

            //            var moveData = $scope.scrollamount;
            //            $scope.$apply(function(){
            //                if(moveData>300){
            //                    $scope.sttButton=true;
            //                }else{
            //                    $scope.sttButton=false;
            //                }
            //            }); //apply
        };

        $scope.showPrevData = function() {
            var dd = angular.copy($rootScope.st_date);
            if ($scope.selected_date <= dd) {
                return false;
            }
            $scope.selected_date.setDate($scope.selected_date.getDate() - 1);
            var date = $scope.selected_date.format("dddd, mmm, d, yyyy");
            window.localStorage["section_" + $stateParams['section_id']] = date;
            $scope.date = date;
            $rootScope["section_" + $stateParams['section_id'] + "_selected_date"] = $scope.selected_date.format("dddd, mmm, d, yyyy");

            bindTextData();
        }
        $scope.showNextData = function() {
            var dd = angular.copy($rootScope.ed_date);
            dd.setDate(dd.getDate() - 1);
            if ($scope.selected_date >= dd) {
                return false;
            }
            $scope.selected_date.setDate($scope.selected_date.getDate() + 1);
            var date = $scope.selected_date.format("dddd, mmm, d, yyyy");
            window.localStorage["section_" + $stateParams['section_id']] = date;
            $scope.date = date;
            $rootScope["section_" + $stateParams['section_id'] + "_selected_date"] = $scope.selected_date.format("dddd, mmm, d, yyyy");

            bindTextData();
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

            var parsha_days = [];

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
                        parsha_days.push([stdt, eddt]);

                        var temp_stdt = angular.copy(stdt);
                        temp_stdt.setDate(temp_stdt.getDate() + DATE_OFFSET);

                        var temp_eddt = angular.copy(eddt);
                        temp_eddt.setDate(temp_eddt.getDate() + DATE_OFFSET);
                        selected_dt.setHours(temp_stdt.getHours());

                        if (temp_eddt >= selected_dt && selected_dt >= temp_stdt) {
                            parsha_id = parsha.ID;
                            $rootScope["section_" + $stateParams['section_id'] + "_selected_parsha_title"] = parsha.text_eng;
                            $scope.parsha_title = parsha.text_eng;
                            window.localStorage["section_" + $stateParams['section_id'] + "_selected_parsha_title"] = parsha.text_eng;
                            $rootScope.daily_parsha_title = $scope.parsha_title;
                        }

                    }

                    var tmp_root_st_dt = angular.copy($rootScope.st_date);
                    $rootScope.st_date.setDate(tmp_root_st_dt.getDate() + DATE_OFFSET);

                    var tmp_root_ed_dt = angular.copy($rootScope.ed_date);
                    $rootScope.ed_date.setDate(tmp_root_ed_dt.getDate() + DATE_OFFSET);
                    
                    
                    var available_date = angular.copy($rootScope.st_date)
                    available_date.setHours(0);
                    var available = false;
                    var disable_days = [];

                    while (available_date < $rootScope.ed_date) {
                        for (i = 0; i < parsha_days.length; i++) {
                            day_item = angular.copy(parsha_days[i]);
                            day_item[1].setDate(day_item[1].getDate() + DATE_OFFSET);
                            day_item[1].setHours(0);
                            day_item[0].setDate(day_item[0].getDate() + DATE_OFFSET);
                            day_item[0].setHours(0);
                            if (day_item[1] >= available_date && available_date >= day_item[0]) {
                                available = true;
                                break;
                            }
                        }

                        if (available == false) {
                              console.log("disable_date ----->" + available_date);
                              console.log("tmp_root_ed_dt ----->" + tmp_root_ed_dt);
                            disable_days.push(angular.copy(available_date));
                        }
                        available = false;
                        available_date.setDate(available_date.getDate() + 1);
                    }

                    $scope.disable_days = disable_days;
                    TextService.getData(parsha_id, section_id, selected_dt).then(function(result) {
                        $scope.textData = result;
                         if(result.length > 10){
                             $scope.loaded = true;
                         }else{
                             $scope.loaded = false;
                         }
                        $ionicLoading.hide();
                    });
                });

        }
    })
    .controller('WeeklyStudyController', function($scope, $ionicScrollDelegate, $location, TextService, $stateParams, $rootScope, ApiService, $ionicLoading, $filter, ionicDatePicker, ParshaService, $ionicHistory) {
        $scope.date = window.localStorage["section_" + $stateParams['section_id']];
        $scope.disable_days = [];
        $scope.set_date = true;
        $scope.loaded = false;
        $scope.section = $stateParams['section_name'];
        var parsha_id = +window.localStorage['parsha_id'];
        var section_id = +$stateParams['section_id'];

        $scope.weekly_index = parseInt(window.localStorage["section_weekly_index_" + section_id]) || 0;
        if ($stateParams['day'] && $scope.date === undefined) {
            $scope.date = $stateParams['day'];
            $scope.set_date = false;
        }
        $scope.selected_date = new Date($scope.date);
        window.localStorage['parsha_id'] = 1;
        window.localStorage['last_section_id'] = $stateParams['section_id'];
        window.localStorage['last_section_title'] = $stateParams['section_name'];
        window.localStorage['last_section_weekly'] = 1;
        window.localStorage['last_section_color'] = $stateParams['section_color'];
        window.localStorage['last_section_copyright'] = $stateParams['section_copyright'];
                
        $scope.parsha_title = $rootScope["section_" + section_id + "_selected_parsha_title"];
        $scope.sectionColor = $stateParams['section_color'];
        window.localStorage['last_section_color'] = $stateParams['section_color'];
        $scope.sectionCopyright = window.localStorage['last_section_copyright'];
        $scope.sectionCopyright_text = $scope.sectionCopyright.split("||")[1];
        $scope.$on('syncing-complete', function(event, args) {
            bindTextData();
        });
        $scope.showDatePicker = function() {
            var selected_date = angular.copy($scope.selected_date);

            var ipObj1 = {
                callback: function(val) { //Mandatory
                    console.log('Return value from the datepicker popup is : ' + val, new Date(val));
                    var selected_dt = new Date(val)
                    selected_dt = selected_dt.addDays(0 - selected_dt.getDay());
                    $scope.selected_date = angular.copy(selected_dt);
                    var date = selected_dt.format("dddd, mmm, d, yyyy");
                    window.localStorage["section_" + $stateParams['section_id']] = date;
                    $scope.date = date;
                    $rootScope["section_" + $stateParams['section_id'] + "_selected_date"] = selected_dt.format("dddd, mmm, d, yyyy");

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
        //        var link = html.split('=')[1].split('>')[0].split('"')[1]
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

            //    var moveData = $scope.scrollamount;
            //    $scope.$apply(function(){
            //    if(moveData>300){
            //    $scope.sttButton=true;
            //    }else{
            //    $scope.sttButton=false;
            //    }
            //    }); //apply
        };

        $scope.showPrevData = function() {
            if ($scope.weekly_index == 0) {
                return false;
            }
            //        $scope.selected_date.setDate($scope.selected_date.getDate()-1);
            $scope.weekly_index = $scope.weekly_index - 1
            $scope.selected_date = $scope.parsha_days[$scope.weekly_index][0]
            $scope.selected_date.setDate($scope.selected_date.getDate() + DATE_OFFSET)
            var date = $scope.selected_date.format("dddd, mmm, d, yyyy");
            window.localStorage["section_" + $stateParams['section_id']] = date;
            $scope.date = date;
            $rootScope["section_" + $stateParams['section_id'] + "_selected_date"] = date;
            bindTextData();
            window.localStorage["section_weekly_index_" + section_id] = $scope.weekly_index;
        }
        $scope.showNextData = function() {
            if ($scope.weekly_index == $scope.parsha_days.length - 1) {
                return false;
            }
            $scope.weekly_index = $scope.weekly_index + 1
            $scope.selected_date = $scope.parsha_days[$scope.weekly_index][0]
            $scope.selected_date.setDate($scope.selected_date.getDate() + DATE_OFFSET)
            var date = $scope.selected_date.format("dddd, mmm, d, yyyy");
            window.localStorage["section_" + $stateParams['section_id']] = date;
            $scope.date = date;
            $rootScope["section_" + $stateParams['section_id'] + "_selected_date"] = date;
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
            var selected_dt = $scope.selected_date
            $scope.parsha_days = [];

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
                            $rootScope["section_" + $stateParams['section_id'] + "_selected_parsha_title"] = parsha.text_eng;
                            window.localStorage["section_" + $stateParams['section_id'] + "_selected_parsha_title"] = parsha.text_eng;
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

                        console.log('$scope.weekly_index->' + $scope.weekly_index);

                        $scope.selected_date = $scope.parsha_days[$scope.weekly_index][0]
                        $scope.selected_date.setDate($scope.selected_date.getDate() + 1)
                        var date = $scope.selected_date.toDateString().slice(4, 15);
                        date = date.replace(date.substr(4, 2), $scope.selected_date.getDate() + ",");
                        window.localStorage["section_" + section_id] = date;
                        $scope.date = date;
                        selected_dt = new Date($scope.date);
                        console.log('scope.date->' + $scope.date);
                    }
                    console.log('parsha_id->' + parsha_id);
                    console.log('section_id->' + section_id);

                    /* end 2016-11-16 */

                    TextService.getData(parsha_id, section_id, $scope.date).then(function(result) {
                        $scope.textData = result;
                        $ionicLoading.hide();
                         if(result.length > 10){
                             $scope.loaded = true;
                         }else{
                             $scope.loaded = false;
                         }
                        
                    });
                });

        }
    })
    .controller('settingCtrl', function($scope, $rootScope, $state, $ionicHistory,SectionService) {
        $scope.selectedItem = window.localStorage['selected_font_size'] || "small";
        $rootScope.font_size = "font-size-" + $scope.selectedItem;
        $scope.sections = [];
        $scope.selectedFontsize     = window.localStorage['selected_font_size'] || "small"
        $scope.selectedSectionType = window.localStorage['selected_default_section_type'] || "specific_section";
        $scope.selectedDateType     = window.localStorage['selected_default_date_type'] || "today";
        $scope.selectedItemLabel    = window.localStorage['selected_default_section_label'];
        $scope.selectedSectionID    = window.localStorage['selected_default_section'] || 1;
                
        $scope.isSpecificSection = false;
        $scope.isSectionPicker = false;
        
        if ($scope.selectedSectionType == "specific_section") {
            $scope.isSpecificSection = true;
        }
        if ($scope.selectedSectionType == "section_picker") {
            $scope.isSectionPicker = true;
        }
        

        $scope.font_sizes = [{
            value: "small",
            label: "Small"
        }, {
            value: "medium",
            label: "Medium"
        }, {
            value: "large",
            label: "Large"
        }];
                
        $scope.specific_section_options = [{
            value: "specific_section",label: "SpecificSection"
            }, {
            value: "left_off", label: "Where I left off"
            }, {
            value: "section_picker",label: "Section picker"
        }];
        $scope.selected_date_type_options = [
            {
                value: "today",label: "Today"
            },
            {
                value: "left_off", label: "Where I left off"
            }];
        $scope.updateFontsize = function(font_size) {
            $rootScope.font_size                        = "font-size-" + font_size;
            $scope.selectedFontsize                     = font_size;
            window.localStorage['selected_font_size']   = font_size;
        }
        $scope.goBack = function() {
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $state.go('menu.setting');
        };

        $scope.updateSectionType = function(section_type) {
            window.localStorage['selected_default_section_type'] = section_type;
            $scope.selectedSectionType = section_type;

            if (section_type == "specific_section") {
                $scope.isSpecificSection = true;
            } else {
                $scope.isSpecificSection = false;
            }

            if (section_type == "section_picker") {
                $scope.isSectionPicker = true;
            } else {
                $scope.isSectionPicker = false;
            }

        }

        $scope.updateDateType = function(date_type) {
            window.localStorage['selected_default_date_type'] = date_type;
            $scope.selectedDateType = date_type;
        }

        $scope.updateSectionID = function(section) {
            console.log('selected_section----->' + section);
            section_id = section.split('***')[0];
            label = section.split('***')[1];
            section_color = section.split('***')[2];
            window.localStorage['selected_default_section'] = section_id;
            window.localStorage['selected_default_section_label'] = label;
            window.localStorage['selected_default_section_color'] = section_color;
            $scope.selectedSectionID = section_id;
            $scope.selectedItemLabel = label;
        }

        $scope.$on('syncing-complete', function(event, args) {
            bindSectionData();
            debugger;
        });

        bindSectionData();

        function bindSectionData() {
            SectionService.getData().then(function(sresult) {
                for (var i = 0; i < sresult.length; i++) {
                    option = {
                        value: sresult[i]['ID'],
                        label: sresult[i]['title'],
                        color: sresult[i]['color']
                    };
                    $scope.sections.push(option);
                }

            });
        }

    })
    .controller('aboutCtrl', function($scope, $rootScope, $ionicHistory, $state, $ionicHistory) {
        $scope.goBack = function() {
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $state.go('menu.setting');
        };

    })
    .controller('defaultSettingsCtrl', function($scope, $rootScope, $state, SectionService, $ionicHistory) {
//        $scope.sections = [];
//        $scope.selectedItem = window.localStorage['selected_default_section'];
//        $scope.selectedSectionType = window.localStorage['selected_default_section_type'] || "specific_section";
//        $scope.selectedDateType = window.localStorage['selected_default_date_type'] || "today";
//        $scope.selectedItemLabel = window.localStorage['selected_default_section_label'];
//
//        $scope.isSpecificSection = false;
//        $scope.isSectionPicker = false;
//                
//        if ($scope.selectedSectionType == "specific_section") {
//            $scope.isSpecificSection = true;
//        }
//        if ($scope.selectedSectionType == "section_picker") {
//            $scope.isSectionPicker = true;
//        }
//
//        $scope.updateSectionType = function(section_type) {
//            window.localStorage['selected_default_section_type'] = section_type;
//            $scope.selectedDateType = section_type;
//
//            if (section_type == "specific_section") {
//                $scope.isSpecificSection = true;
//            } else {
//                $scope.isSpecificSection = false;
//            }
//
//            if (section_type == "section_picker") {
//                $scope.isSectionPicker = true;
//            } else {
//                $scope.isSectionPicker = false;
//            }
//
//        }
//
//        $scope.updateDateType = function(date_type) {
//            window.localStorage['selected_default_date_type'] = date_type;
//            $scope.selectedDateType = date_type;
//        }
//
//        $scope.update = function(section) {
//            console.log('selected_section----->' + section);
//            section_id = section.split('***')[0];
//            label = section.split('***')[1];
//            section_color = section.split('***')[2];
//            window.localStorage['selected_default_section'] = section_id;
//            window.localStorage['selected_default_section_label'] = label;
//            window.localStorage['selected_default_section_color'] = section_color;
//            $scope.selectedItem = section_id;
//            $scope.selectedItemLabel = label;
//        }
//
//        $scope.$on('syncing-complete', function(event, args) {
//            bindSectionData();
//            debugger;
//        });
//
//        bindSectionData();
//
//        function bindSectionData() {
//            SectionService.getData().then(function(sresult) {
//                for (var i = 0; i < sresult.length; i++) {
//                    option = {
//                        value: sresult[i]['ID'],
//                        label: sresult[i]['title'],
//                        color: sresult[i]['color']
//                    };
//                    $scope.sections.push(option);
//                }
//
//            });
//        }
//
//        $scope.goBack = function() {
//            $ionicHistory.nextViewOptions({
//                disableBack: true
//            });
//            $state.go('menu.setting');
//        };
//
    })
