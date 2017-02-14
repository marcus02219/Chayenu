angular.module('app.controllers')
    .controller('parshaOverviewMaaseiCtrl',
        function($scope, $ionicScrollDelegate, $ionicModal, $rootScope, SectionService, $state, TextService, ParshaService, $ionicLoading, ionicDatePicker, $ionicHistory) {
//            if (window.localStorage['selected_default_section'] == undefined) {
//                $state.go('menu.default_settings');
//            }
            $scope.selectedItem = window.localStorage['selected_font_size'] || "small";
            $rootScope.font_size = "font-size-" + $scope.selectedItem;
            $scope.disable_days = [];
            $scope.sectionColor = window.localStorage['last_section_color'] || "#da2b40";
            $scope.parsha_title = "";
            $scope.sttButton = false;
            $scope.sectionCopyright = window.localStorage['last_section_copyright'];

            $rootScope.hashtag = function() {
                if ($rootScope.modal == undefined) {
                    $ionicModal.fromTemplateUrl('sidemenu.html', {
                        scope: $rootScope,
                        animation: 'slide-in-up',
                        focusFirstInput: true
                    }).then(function(modal) {
                        $rootScope.modal = modal;
                        $rootScope.modal.show();
                    });
                }
            };

            $rootScope.openModal = function() {
                $rootScope.modal.show();
            };
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $rootScope.closeModal = function(link, params) {
                $state.go(link, params);
                $rootScope.modal.hide();
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
            };
            $rootScope.closeModalMenu = function() {
                $rootScope.modal.hide();
            };
            $rootScope.$on('$destroy', function() {
                $rootScope.modal.remove();
            });

            $rootScope.$on('modal.hidden', function() {
                //                $rootScope.modal.remove();
            });

            $scope.$on('modal.removed', function() {});

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

                //    var moveData = $scope.scrollamount;
                //    $scope.$apply(function(){
                //    if(moveData>300){
                //    $scope.sttButton=true;
                //    }else{
                //    $scope.sttButton=false;
                //    }
                //    }); //apply
            };

            $scope.$on('syncing-complete', function(event, args) {
                SectionService.getData().then(function(result) {
                    $scope.sectionData = result;

                    if (!!window.localStorage['last_section_id'] == true) {
                        if (window.localStorage['last_section_weekly'] == 1) {
                            $ionicHistory.nextViewOptions({
                                disableBack: true
                            });
                            $state.go('menu.parshaWeeklyOverview');
                        }
                    } else {
                        if ($scope.sectionData[0].weekly == 1) {

                            //                    $ionicHistory.nextViewOptions({
                            //                        disableBack: true;
                            //                    });

                            window.localStorage['last_section_id'] = $scope.sectionData[0].ID;
                            window.localStorage['last_section_title'] = $scope.sectionData[0].title;
                            window.localStorage["section_" + result[0].ID] = new Date().toDateString().slice(4, 15);
                            $ionicHistory.currentView($ionicHistory.backView());
                            $state.go('menu.parshaWeeklyOverview', {}, {
                                location: 'replace'
                            });
                            return false;
                        }
                    }
                    bindTextData();

                });
            });

            $scope.showDatePicker = function() {
                var selected_date = angular.copy($scope.selected_date);
                var ipObj1 = {
                    callback: function(val) { //Mandatory
                        console.log('Return value from the datepicker popup is : ' + val, new Date(val));
                        var selected_dt = new Date(val)
                        $scope.selected_date = angular.copy(selected_dt);
                        var date = selected_dt.format("dddd, mmm, d'th', yyyy");
                        window.localStorage["section_" + $scope.section_id] = date
                        $scope.date = date;
                        $rootScope["section_" + $scope.section_id + "_selected_date"] = date;

                        bindTextData();
                    },
                    selectedDateCallback: function(val) {
                        console.log('select date : ' + val, new Date(val));
                    },
                    from: $rootScope.st_date, //Optional
                    to: $rootScope.ed_date, //Optional

                    disabledDates: $scope.disable_days,
                    isDaily: true,
                    dateFormat: 'MMMM dd, yyyy',
                    inputDate: selected_date, //Optional
                    mondayFirst: false, //Optional
                    closeOnSelect: false, //Optional
                    templateType: 'popup' //Optional
                };
                ionicDatePicker.openDatePicker(ipObj1);
            };

            $scope.showPrevData = function() {
                var dd = angular.copy($rootScope.st_date);
                if ($scope.selected_date <= dd) {
                    return false;
                }
                $scope.selected_date.setDate($scope.selected_date.getDate() - 1);
                var date = $scope.selected_date.format("dddd, mmm, d'th', yyyy");
                window.localStorage["section_" + $scope.section_id] = date
                $scope.date = date;
                $rootScope["section_" + $scope.section_id + "_selected_date"] = date;

                bindTextData();
            }
            $scope.showNextData = function() {
                var dd = angular.copy($rootScope.ed_date);
                dd.setDate(dd.getDate() - 1);
                if ($scope.selected_date >= dd) {
                    return false;
                }
                $scope.selected_date.setDate($scope.selected_date.getDate() + 1);

                var date = $scope.selected_date.format("dddd, mmm, d'th', yyyy");
                window.localStorage["section_" + $scope.section_id] = date;
                $scope.date = date;
                $rootScope["section_" + $scope.section_id + "_selected_date"] = date;

                bindTextData();
            }

            function bindTextData() {
                $ionicScrollDelegate.scrollTop(true);
                $scope.sttButton = false;
                $ionicLoading.show({
                    template: '<ion-spinner icon="ios"></ion-spinner>'
                });
                var parsha_id = 0;
                //            var section_id = $scope.sectionData[0].ID;

                
                
                var selectedSectionType = window.localStorage['selected_default_section_type'];
                var selectedDateType    = window.localStorage['selected_default_date_type'];
                
                var selectedItem        = window.localStorage['selected_default_section'];
                var selectedItemLabel   = window.localStorage['selected_default_section_label'];
                var selectedColor       = window.localStorage['selected_default_section_color'];
                var section_id          = 0;
                var section_title       = "";
                
                if(selectedSectionType == "left_off" || selectedSectionType == undefined){
                    section_id          = window.localStorage["last_section_id"] || $scope.sectionData[0].ID;
                    section_title       = window.localStorage["last_section_title"] || $scope.sectionData[0].title;
                    $scope.sectionColor = window.localStorage['last_section_color'] || "#da2b40";
                }else{
                    section_id          = selectedItem;
                    section_title       = selectedItemLabel;
                    $scope.sectionColor = selectedColor;
                }
                
                
                $scope.parsha_title = window.localStorage["section_" + section_id + "_selected_parsha_title"];
                
                console.log('xxxxxxx' + window.localStorage["section_" + section_id + "_selected_parsha_title"])

                var dd = new Date().format("dddd, mmm, d'th', yyyy");
                var date = window.localStorage["section_" + section_id] || dd
                
                if(selectedDateType == "today"){
                    date = dd;
                }
                
                
                var parsha_days = [];

                var mini_date = new Date(MIN_DATE);
                var stored_date = new Date(date.replace('th,', ','));
                if (stored_date < mini_date) {
                    date = mini_date.format("dddd, mmm, d'th', yyyy");
                }

                $scope.date         = date;
                $scope.section_id   = section_id;
                $scope.section      = section_title;
                $scope.selected_date= new Date(stored_date);
                
                var selected_dt = new Date($scope.date.replace('th,', ','));

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

                            parsha_days.push([stdt, eddt]);

                            var temp_stdt = angular.copy(stdt);
                            temp_stdt.setDate(temp_stdt.getDate() + DATE_OFFSET);

                            var temp_eddt = angular.copy(eddt);
                            temp_eddt.setDate(temp_eddt.getDate() + DATE_OFFSET);
                            selected_dt.setHours(temp_stdt.getHours());
                            if (temp_eddt >= selected_dt && selected_dt >= temp_stdt) {
                                $scope.parsha_title = parsha.text_eng;
                                parsha_id = parsha.ID;
                                window.localStorage["section_" + section_id + "_selected_parsha_title"] = parsha.text_eng;
                                $scope.parsha_title = parsha.text_eng;
                                $rootScope.daily_parsha_title = $scope.parsha_title;

                            }

                        }

                        var tmp_root_st_dt = angular.copy($rootScope.st_date);
                        $rootScope.st_date.setDate(tmp_root_st_dt.getDate() + DATE_OFFSET);

                        var tmp_root_ed_dt = angular.copy($rootScope.ed_date);
                        $rootScope.ed_date.setDate(tmp_root_ed_dt.getDate() + DATE_OFFSET);

                        var available_date = angular.copy($rootScope.st_date)
                        var available = false;
                        var disable_days = [];

                        while (available_date < $rootScope.ed_date) {
                            for (i = 0; i < parsha_days.length; i++) {
                                day_item = angular.copy(parsha_days[i]);
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

                        TextService.getData(parsha_id, section_id, $scope.selected_date).then(function(result) {
                            $scope.textData = result;
                            $ionicLoading.hide();
                        });
                    });

            }

        })
