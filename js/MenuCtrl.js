angular.module('app.controllers').controller('MenuCtrl', function($scope, $rootScope, SectionService, ApiService, $ionicLoading, $filter, ParshaService) {
var mini_date = new Date(MIN_DATE);
var cur_date = new Date();
var show_cur_date = null;
var dd = cur_date.toDateString().slice(4,15);

$scope.todays_date = dd.replace(dd.substr(4,2), cur_date.getDate()+",");
if(cur_date < mini_date){
dd = mini_date.toDateString().slice(4,15);
$scope.todays_date = dd.replace(dd.substr(4,2), mini_date.getDate()+",");
}

//    $scope.todays_date = window.localStorage["section_2"];

$scope.$on('syncing-complete', function(event, args) {
bindSectionData();
debugger;
});

bindSectionData();

$scope.$on('date-update', function(event, args){
var section = $filter('filter')($scope.sectionData, {ID: args['section_id']})[0];
section.date = args['new_date'];

})

function bindSectionData(){
$scope.sectionData = [];
$scope.parsha_title = "";

SectionService.getData().then(function(sresult){
    ParshaService.getData($scope.todays_date).then(function(result){
    stdt = new Date(result[0].start_date);
    eddt = new Date(result[0].end_date);
    var parsha_id = 0;
    for (var i = 0; i < result.length; i++) {
    parsha = result[i];
    stdt = new Date(parsha.start_date);
    eddt = new Date(parsha.end_date);

    var temp_eddt = angular.copy(eddt);
    temp_eddt.setDate(temp_eddt.getDate()+1);

    if(temp_eddt >= cur_date && cur_date >= stdt){
    parsha_id = parsha.ID;
    $scope.parsha_title = parsha.text_eng;
    }

    }

    if(parsha_id==0){
    parsha_id = result[0].ID;
    $scope.parsha_title = result[0].text_eng;
    }

    for (var i = 0; i < sresult.length; i++) {
        menu = sresult[i];
        var dd = window.localStorage["section_"+menu.ID] || new Date().format("dddd, mmm, d'th', yyyy");
        menu.date = dd.replace('th,', ',');

        var mini_date = new Date(MIN_DATE);
        var stored_date = new Date(menu.date);

        var show_mm_date = null;
        if(menu.date){
        show_mm_date = stored_date.format("dddd, mmm, d'th', yyyy");
        }


        if(stored_date < mini_date){
        date = mini_date.toDateString().slice(4,15);
        menu.date = date.replace(date.substr(4,2), mini_date.getDate()+",");
        show_mm_date = mini_date.format("dddd, mmm, d'th', yyyy");
        }
        menu.parsha_title = window.localStorage["section_"+menu.ID+"_selected_parsha_title"];

        $rootScope["section_"+menu.ID+"_selected_parsha_title"] = menu.parsha_title || $scope.parsha_title;

        var show_cur_date = cur_date.format("dddd, mmm, d'th', yyyy");
        if(cur_date < mini_date){
        show_cur_date = mini_date.format("dddd, mmm, d'th', yyyy");
        }
        $rootScope["section_"+menu.ID+"_selected_date"] = show_mm_date || show_cur_date;

        $scope.sectionData.push(menu);

    }

});
//			$scope.sectionData = result;
debugger;
});
}

});
