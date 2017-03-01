var ENV = "phone";
var MIN_DATE = "2016-10-24";
var DATE_OFFSET = 0;
var APP_VERSION = 1.20;
var DB_VERSION = 1.21;
DATE_OFFSET = new Date().getTimezoneOffset() > 0 ? 1 : 0

angular.module('app.services', [])

.factory('$cordovaDatePicker', ['$window', '$q', function ($window, $q) {
    return {
        show: function (options) {
            var q = $q.defer();
            options = options || {date: new Date(), mode: 'date'};
            $window.datePicker.show(options, function (date) {
                q.resolve(date);
            });
            return q.promise;
        }
    };
}])

.factory('BlankFactory', [function(){

}])

.service('BlankService', [function(){

}]);

var db_starter = angular.module('db_starter', [])
db_starter.factory('DBHelperService', ['$q','$window', DBHelperService])
db_starter.factory('ParshaService', ['$q', 'DBHelperService', ParshaService]);
db_starter.factory('SectionService', ['$q', 'DBHelperService', SectionService]);
db_starter.factory('TextService', ['$q', 'DBHelperService', 'TextChildService', TextService]);
db_starter.factory('TextChildService', ['$q', 'DBHelperService', TextChildService]);
db_starter.factory('UserDataService', ['$q', 'DBHelperService', UserDataService]);

function DBHelperService($q, $window, dbhelper){
    return {
        createTables: createTables,
        executeStatement: executeStatement,
        executeMultipleStatements: executeMultipleStatements,
        bulkDelete: bulkDelete,
        getDB: getDB,
        db: "",
        sqlResultToArr: sqlResultToArr
    }

    function getDB(){
        
        if(this.db != ""){
            return this.db;
        }

        if(ENV == "web"){
            this.db = window.openDatabase('chayanuDB', '1.0', 'Chayanu DB', 2 * 1024 * 1024);
        } else {
            if(!$window.sqlitePlugin){
                return false;
            }
            this.db = $window.sqlitePlugin.openDatabase({name: 'chayanuDB', location: 'default'});
        }

        return this.db;
    }


    function createTables(){
        var mainDefer = $q.defer();
        if(!this.getDB()){
            mainDefer.resolve("sqlite plugin is not available");
            return mainDefer.promise;
        }
        this.getDB().transaction(function(tx) {
            var deferrals = [$q.defer(), $q.defer(), $q.defer(), $q.defer(), $q.defer()];
            var promises = [deferrals[0].promise, deferrals[1].promise, deferrals[2].promise, deferrals[3].promise, deferrals[4].promise];
             
            if(window.localStorage['installed_app'] != DB_VERSION){
                tx.executeSql("DROP TABLE IF EXISTS user_data");
                tx.executeSql("DROP TABLE IF EXISTS parshas");
                tx.executeSql("DROP TABLE IF EXISTS sections");
                tx.executeSql("DROP TABLE IF EXISTS text");
                tx.executeSql("DROP TABLE IF EXISTS text_child");
            }
                                 
            window.localStorage['installed_app'] = DB_VERSION;
            tx.executeSql("CREATE TABLE IF NOT EXISTS user_data(ID INTEGER PRIMARY KEY AUTOINCREMENT, data_name TEXT, value TEXT)", [], function(tx, result){
                deferrals[0].resolve(result);
            });
            tx.executeSql("CREATE TABLE IF NOT EXISTS parshas(ID INTEGER PRIMARY KEY AUTOINCREMENT, start_date DATE, end_date DATE, text_eng TEXT, text_heb TEXT)", [], function(tx, result){
                deferrals[1].resolve(result);
            });
            tx.executeSql("CREATE TABLE IF NOT EXISTS sections(ID INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, color TEXT, parsha_id INTEGER, order_key INTEGER, weekly INTEGER, copyright TEXT)", [], function(tx, result){
                deferrals[2].resolve(result);
            });
            tx.executeSql("CREATE TABLE IF NOT EXISTS text(ID INTEGER PRIMARY KEY AUTOINCREMENT, section_id INTEGER, parsha_id INTEGER, day_num INTEGER, order_key INTEGER, chapter_id INTEGER, posuk INTEGER, text_eng TEXT, text_heb TEXT, text_both TEXT, child_id INTEGER)", [], function(tx, result){
                deferrals[3].resolve(result);
            });
            tx.executeSql("CREATE TABLE IF NOT EXISTS text_child(ID INTEGER PRIMARY KEY AUTOINCREMENT, parsha_id INTEGER, sibling_order INTEGER, parent_id INTEGER, type_id INTEGER, text_eng TEXT, text_heb TEXT)", [], function(tx, result){
                deferrals[4].resolve(result);
            });
            
            $q.all(promises).then(function(result){
                mainDefer.resolve("success");
                var sql = "CREATE INDEX IF NOT EXISTS index_text ON text (parsha_id,section_id,day_num)";
                dbhelper.executeStatement(sql);

            });

        }, function(error) {
            
        }, function() {

        });

        return mainDefer.promise;
    }



    function executeMultipleStatements(statement, values){
        var deferred = $q.defer();
        var promises = [];

         if(!this.getDB()){
            deferred.resolve([]);
            return deferred.promise;
        }

        var k = 0;
        this.getDB().transaction(function(tx) {
            var length = values.length;
            for(var i = 0; i < length; i++){
                promises.push($q.defer());
                tx.executeSql(statement, values[i]);
            }           

        }, function(error) {
            debugger;

            deferred.reject(error);
        }, function(result) {
            promises[k].resolve("success");
            k++;
        });

        
        $q.all(promises).then(function(){
            deferred.resolve("success");
        });
        

        return deferred.promise;
    }



    function executeStatement(statement, values){
        var deferred = $q.defer();
         if(!this.getDB()){

            deferred.resolve([]);
             
            return deferred.promise;
         }
        this.getDB().transaction(function(tx) {

            tx.executeSql(statement, values, function(tx, results){
                deferred.resolve(results);
                
            });

        }, function(error) {
            debugger;
            deferred.reject(error);
        }, function() {

        });
        
        return deferred.promise;
    }

    function bulkDelete(table, data){
        data = data[table]['delete'];
        var num_rows = data.length;
        var sql;
        var promises = [];
        var mainDefer  = $q.defer();
        var values = [];
        var subValues;

        sql = "DELETE FROM "+table+" WHERE ID = ?"
        for(var i = 0; i < data.length; i++){
            
            subValues = [data[i]['id']];
            values.push(subValues);
        }

        if(values.length == 0){
            mainDefer.resolve("success");
            return mainDefer.promise;
        }

        this.executeMultipleStatements(sql, values).then(function(){
            mainDefer.resolve("success");
        });

        return mainDefer.promise;
    }

    function sqlResultToArr(sqlResultPromise){
        var mainDefer = $q.defer();

        sqlResultPromise.then(function(result){
            var arr = [];
            var length = result.rows.length;
            for(var i = 0; i < length; i++){
                arr.push(result.rows.item(i));
            }
            mainDefer.resolve(arr);
        })

        return mainDefer.promise;
    }
}

function ParshaService($q, dbhelper){
    var that = this;

    return {
        bulkInsert: bulkInsert,
        getData: getData
    }

    function bulkInsert(data){
        data = data['parshas']['insert'];
        var num_rows = data.length;
        var sql;
        var promises = [];
        var mainDefer  = $q.defer();
        var values = [];
        var subValues;

        sql = "INSERT or REPLACE INTO parshas (ID, start_date, end_date, text_eng, text_heb) VALUES(?, ?, ?, ?, ?)";

        for(var i = 0; i < num_rows; i++){
            
            subValues = [data[i]['id'], data[i]['start_date'], data[i]['end_date'], data[i]['text_eng'], data[i]['text_heb']];
            values.push(subValues);
        }

        if(values.length == 0){
            mainDefer.resolve("success");
            return mainDefer.promise;
        }

        dbhelper.executeMultipleStatements(sql, values, "multiple statements").then(function(){
            mainDefer.resolve("success");
        });

        return mainDefer.promise;
    }

    function getData(date){
        var result;
        date = new Date(date).valueOf();

//        sql = "SELECT * FROM parshas WHERE start_date >= ? AND end_date <= ?;"
        sql = "SELECT * FROM parshas;"

//        return dbhelper.executeStatement(sql, values);
        return dbhelper.sqlResultToArr(dbhelper.executeStatement(sql));

    }
}

function SectionService($q, dbhelper){
    var that = this;
    
    return {
        bulkInsert: bulkInsert,
        getData: getData
    }

    function bulkInsert(data){
        data = data['sections']['insert'];

        var num_rows = data.length;
        var sql;
        var promises = [];
        var mainDefer  = $q.defer();
        var values = [];
        var subValues;

        sql = "INSERT or REPLACE INTO sections (ID, title, color, parsha_id, order_key, weekly, copyright) VALUES(?, ?, ?, ?, ?, ?, ?)";
        
        for(var i = 0; i < num_rows; i++){
            
            subValues = [data[i]['id'], data[i]['title'], data[i]['color'], data[i]['parsha_id'], data[i]['order'], data[i]['weekly'], data[i]['copyright']];
            values.push(subValues);
        }

        if(values.length == 0){
            mainDefer.resolve("success");
            return mainDefer.promise;
        }

        dbhelper.executeMultipleStatements(sql, values, "multiple statements").then(function(result){
            mainDefer.resolve("success");
        });

        return mainDefer.promise;
    }

    function getData(){
        var result;
        
        sql = "SELECT * FROM sections ORDER BY order_key ASC;"
        return dbhelper.sqlResultToArr(dbhelper.executeStatement(sql));
    }
}

function TextService($q, dbhelper, TextChildService){
    var that = this;

    return {
        bulkInsert: bulkInsert,
        getData: getData
    }

    function bulkInsert(data){
        data = data['text']['insert'];
        var num_rows = data.length;
        var sql;
        var promises = [];
        var mainDefer  = $q.defer();
        var values = [];
        var subValues;

        sql = "INSERT or REPLACE INTO text (ID, section_id, parsha_id, day_num, order_key, chapter_id, posuk, text_eng, text_heb, text_both, child_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        for(var i = 0; i < num_rows; i++){
            
            var text_eng = escape(data[i]['text_eng']);
            var text_heb = escape(data[i]['text_heb']);
            var text_both =  escape(data[i]['text_both']);
            
            subValues = [data[i]['id'], data[i]['section_id'], data[i]['parsha_id'], data[i]['day_num'], data[i]['order'], data[i]['chapter_id'], data[i]['posuk'],text_eng, text_heb, text_both, data[i]['child_id']];
            
            values.push(subValues);
        }

        if(values.length == 0){
            mainDefer.resolve("success");
            return mainDefer.promise;
        }

        dbhelper.executeMultipleStatements(sql, values, "multiple statements").then(function(){
            mainDefer.resolve("success");
        });

        return mainDefer.promise;
    }


    function getData(parsha_id, section_id, day){
        var day_num = new Date(day).getDay() + 1;
        var result;
        console.log("get_text_data="+day);
        
        // sql = "SELECT text.text_eng, text.text_heb, text.text_both, text.child_id, text.parsha_id, text_child.text_eng AS text_child_eng, text_child.text_heb AS text_child_heb FROM text LEFT JOIN text_child ON text.ID = text_child.parent_id WHERE text.parsha_id = ? AND text.section_id = ? AND text.day_num = ? ORDER BY text.order_key ASC, text_child.sibling_order ASC;"
        sql = "SELECT text.ID, text.child_id, text.text_eng, text.text_heb, text.text_both, text.child_id, text.parsha_id FROM text WHERE text.parsha_id = ? AND text.section_id = ? AND text.day_num = ? ORDER BY text.order_key ASC;"
        var values = [parsha_id, section_id, day_num];

        console.log(values);
        
        var promises = [];
        var childrenParentIndexes = [];
        var dataArr = [];
        var deferred = $q.defer();

        dbhelper.executeStatement(sql, values).then(function(result){
            var length = result.rows.length;
            var row_data = null;
            for(var i = 0; i < length; i++){
                row_data = angular.copy(result.rows.item(i))
                row_data.text_eng = unescape(result.rows.item(i).text_eng);
                row_data.text_heb = unescape(result.rows.item(i).text_heb);
                row_data.text_both = unescape(result.rows.item(i).text_both);
                dataArr.push(row_data);

                if(!result.rows.item(i).child_id){
                    dataArr[i].children = null;
                    continue;
                }
                
                childrenParentIndexes.push(i);
                promises.push(TextChildService.getData(result.rows.item(i).ID, i));
            }

            deferred.resolve("success");

        });
        var subDefer = $q.defer();
        deferred.promise.then(function(){
            $q.all(promises).then(function(resultArrs){
                for(var i = 0; i < resultArrs.length; i++){
                    var parent_index = childrenParentIndexes[i];
                                  
                    dataArr[parent_index].children = [];
                    for(var k = 0; k < resultArrs[i].rows.length; k++){
                        dataArr[parent_index].children.push(resultArrs[i].rows.item(k));
                    }
                }
                subDefer.resolve(dataArr);
            })
        })

        

        return subDefer.promise;
        
    }
}

function TextChildService($q, dbhelper){
    return {
        bulkInsert: bulkInsert,
        getData: getData
    }

    function bulkInsert(data){
        data = data['text_child']['insert'];
        var num_rows = data.length;
        var sql;
        var mainDefer  = $q.defer();
        var values = [];
        var rowValues;

        sql = "INSERT or REPLACE INTO text_child (ID, parsha_id, sibling_order, parent_id, type_id, text_eng, text_heb) VALUES (?, ?, ?, ?, ?, ?, ?)";
        for(var i = 0; i < num_rows; i++){
            rowValues = [data[i]['id'], data[i]['parsha_id'], data[i]['sibling_order'], data[i]['parent_id'], data[i]['type_id'], data[i]['text_eng'], data[i]['text_heb']]
            values.push(rowValues);
        }


        dbhelper.executeMultipleStatements(sql, values, "multiple statements").then(function(){
            mainDefer.resolve("success");
        });

        return mainDefer.promise;
    }

    function getData(parentId, i){
        
        sql = "SELECT text_heb, text_eng FROM text_child WHERE parent_id = ?"
        var values = [parentId];
        var message = {arr_i: i};
        return dbhelper.executeStatement(sql, values, message['arr_i']);
    }

}

function UserDataService($q, dbhelper){
    return {
        insertData: insertData,
        getData: getData
    }

    function insertData(data_name, value){
        this.getData(data_name).then(function(result){
            if(result.rows.length){
                var sql = "UPDATE user_data SET data_name = ?, value = ? WHERE data_name = '"+data_name+"';";
            } else {
                var sql  = "INSERT INTO user_data (data_name, value) VALUES (?, ?);";
            }

            var values = [data_name, value];
            dbhelper.executeStatement(sql, values);
        });
    }

    function getData(query){
        sql = "SELECT * FROM user_data WHERE data_name = ?";
        var values = [query];
        
        return dbhelper.executeStatement(sql, values);
    }
}


angular.module('data.sync', ['db_starter']).factory("ApiService", ['$q', '$injector', ApiService]);

function ApiService($q, $injector){

    return {
        initApi: initApi,
        checkConnection: checkConnection,
        db_injector: angular.injector(['ng', 'db_starter'])
    };

    function initApi(date, type){
        if(checkConnection() == false){
            return false;
        }
        
        if(type == "fetch"){
            var mainDefer = $q.defer();
            var that = this;
            $injector.get("DBHelperService").createTables().then(function(){
                fetchData(date, that).then(function(){
                    mainDefer.resolve("success");
                });
            });

            return mainDefer.promise;
        }

        if(type == "select"){
            selectData();
        }
        
    }

    function checkConnection(){
        if(ENV == "web"){
            return true;
        }

        var connection = navigator.connection.type;
        if(connection == Connection.NONE || connection == Connection.UNKNOWN){
            return false;
        }

        return true;
    }

    function fetchData(last_date, api_service){
        var mainDefer = $q.defer();
        
        $.ajax({
            type: "GET",
            url: "http://104.236.239.55/api_dev/sync_data.php?last_synced="+last_date,
            dataType: "json",
            success: function (response_data) {
                
                
                var table_data = response_data['tables'];
                var promises = [];
                var time = new Date().getTime();
                promises.push($injector.get('ParshaService').bulkInsert(table_data));
                promises.push($injector.get('SectionService').bulkInsert(table_data));
                promises.push($injector.get('TextChildService').bulkInsert(table_data));
                promises.push($injector.get('TextService').bulkInsert(table_data));

                promises.push($injector.get('DBHelperService').bulkDelete("parshas", table_data));
                promises.push($injector.get('DBHelperService').bulkDelete("sections", table_data));
                promises.push($injector.get('DBHelperService').bulkDelete("text", table_data));
                promises.push($injector.get('DBHelperService').bulkDelete("text_child", table_data));
                
                $injector.get('UserDataService').insertData("last_synced", response_data["last_updated"]);
                window.localStorage["last_synced"] = response_data["last_updated"];
                
                
                $q.all(promises).then(function(data){
                    
                    time = (new Date().getTime() - time) / 1000;
                    debugger;
                    mainDefer.resolve("db insert time: "+time);
                });

                
            },
            error: function (textStatus, errorThrown) {
                
                console.log(errorThrown);
            }

        });

        return mainDefer.promise;
    }


    function selectData(){
        
        $injector.get('TextService').getData(1, 1, "08/14/2016").then(function(result){
            
        });
    }

    
}



