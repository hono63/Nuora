// テーマのロード。お好みのものを。
//$("head").append('<link href="https://unpkg.com/tabulator-tables@4.8.1/dist/css/tabulator.min.css" rel="stylesheet">'); // 標準
$("head").append('<link href="https://unpkg.com/tabulator-tables@4.8.1/dist/css/tabulator_simple.min.css" rel="stylesheet">'); // シンプル
//$("head").append('<link href="https://unpkg.com/tabulator-tables@4.8.1/dist/css/bootstrap/tabulator_bootstrap.min.css" rel="stylesheet">'); // Bootstrap3

// Redmine情報。ajaxで取ってくることもできるけど、ページ読み込み遅くなりそうなのでとりあえず固定。
var INFO ={
 // /users.json を以下に貼り付け ("total_count","offset","limit" などは削除してね)
"users":[{"id":1,"login":"hono63","admin":true,"firstname":"N","lastname":"H","mail":"dummy@gmail.com","created_on":"2020-09-23T10:49:34Z","last_login_on":"2020-10-07T15:00:36Z"}]
, // /issue_statuses.json を以下に貼り付け
"issue_statuses":[{"id":1,"name":"新規","is_closed":false},{"id":2,"name":"進行中","is_closed":false},{"id":3,"name":"解決","is_closed":false},{"id":4,"name":"フィードバック","is_closed":false},{"id":5,"name":"終了","is_closed":true},{"id":6,"name":"却下","is_closed":true}]
, // /enumerations/issue_priorities.json を以下に貼り付け
"issue_priorities":[{"id":1,"name":"低め","is_default":false,"active":true},{"id":2,"name":"通常","is_default":true,"active":true},{"id":3,"name":"高め","is_default":false,"active":true},{"id":4,"name":"急いで","is_default":false,"active":true},{"id":5,"name":"今すぐ","is_default":false,"active":true}]
};

var apiKey = "";
$.get('/redmine/my/account').done(function(data){
    apiKey = $('#content > div.box > pre', $(data)).first().text();
});

// Tabulatorのjsを読み込み後、スクリプト実行
$.getScript("https://unpkg.com/tabulator-tables@4.8.1/dist/js/tabulator.min.js", function () {
    // テーブル埋め込み
    $('table.issues').after('<div id="tabulator-issues"></div>');

    // 辞書作成
    var USERID2NAME = {};
    var USERNAME2ID = {"":""};
    var USERS = [];
    var STATUSID2NAME = {};
    var STATUSNAME2ID = {};
    var STATUSES = [];
    var PRIORITYID2NAME = {};
    var PRIORITYNAME2ID = {};
    var PRIORITIES = [];
    for (let i = 0; i < INFO["users"].length; i++){
        let id   = INFO["users"][i]["id"];
        let name = INFO["users"][i]["firstname"] + " " + INFO["users"][i]["lastname"];
        USERID2NAME[id]   = name;
        USERNAME2ID[name] = id;
        USERS.push(name);
    }
    for (let i = 0; i < INFO["issue_statuses"].length; i++){
        let id   = INFO["issue_statuses"][i]["id"];
        let name = INFO["issue_statuses"][i]["name"];
        STATUSID2NAME[id]   = name;
        STATUSNAME2ID[name] = id;
        STATUSES.push(name);
    }
    for (let i = 0; i < INFO["issue_priorities"].length; i++){
        let id   = INFO["issue_priorities"][i]["id"];
        let name = INFO["issue_priorities"][i]["name"];
        PRIORITYID2NAME[id]   = name;
        PRIORITYNAME2ID[name] = id;
        PRIORITIES.push(name);
    }

    // テーブルのヘッダ作成
    var tableHeader = [];
    $('table.issues').find('th').each(function(index, ele){
        let cls = $(ele).attr("class");
        if("checkbox hide-when-print" == cls){
            // do nothing
        }else if("buttons" == cls){
            // do nothing
        }else if("id" == cls){
            tableHeader.push({title:"#", field:"rid", frozen:true, editor:false, formatter:"html", formatter:function(cell, formatterParams, onRendered){ 
                // IDにリンクを付けるためのコールバック関数
                let val = cell.getValue();
                return '<a href="/redmine/issues/' + val + '">' + val+ '</a>'; 
            }});
        }else if("project" == cls || "tracker" == cls || "updated_on" == cls){
            tableHeader.push({title:$(ele).text(), field:cls}); // project, tracker, 更新日はedit禁止とする 
        }else if("subject" == cls){
            tableHeader.push({title:$(ele).text(), field:cls, editor:true, minWidth:300});
        }else if("assigned_to" == cls){
            tableHeader.push({title:$(ele).text(), field:cls, editor:"select", editorParams:{values:USERS}}); 
        }else if("status" == cls){
            tableHeader.push({title:$(ele).text(), field:cls, editor:"select", editorParams:{values:STATUSES}}); 
        }else if("priority" == cls){
            tableHeader.push({title:$(ele).text(), field:cls, editor:"select", editorParams:{values:PRIORITIES}}); 
        }else{
            tableHeader.push({title:$(ele).text(), field:cls, editor:true});
        }
    });
    tableHeader.push({title: "Upd.", field: "updated", width:90, hozAlign:"center", formatter:"tickCross", sorter:"boolean", editor:false});

    // テーブルのデータ作成
    var tableData = [];
    $('table.issues > tbody').find('tr').each(function(tr_index, tr_ele){
        let a_data = {id: tr_index + 1};
        let is_description_row = false;
        $(tr_ele).find('td').each(function(index, ele){
            let cls = $(ele).attr("class");
            if("checkbox" == cls){
                // ひとまず無視
            }else if("description block_column" == cls){
                // 説明文。この行はひとまず無視
                is_description_row = true;
            }else if("id" == cls){
                a_data["rid"] = $(ele).text();
            }else{
                a_data[cls] = $(ele).text();
            }
        });
        if(!is_description_row){
            a_data["updated"] = true;
            tableData.push(a_data);
        }
    });

    // テーブル隠す
    $('table.issues').hide();

    var table = new Tabulator("#tabulator-issues", {
        height: "80%", 
        data: tableData, 
        layout: "fitDataStretch", 
        columns: tableHeader,
        //autoColumns: true,
        cellEdited: function(cell){
            let cell_data = cell["_cell"]["row"]["data"];
            let issue_url = "/redmine/issues/" + cell_data["rid"] + ".json";
            let posting_json = {
                "issue": {
                    "subject": cell_data["subject"],
                    "assigned_to_id": USERNAME2ID[cell_data["assigned_to"]],
                    "status_id": STATUSNAME2ID[cell_data["status"]],
                    "priority_id": PRIORITYNAME2ID[cell_data["priority"]],
                }
            };
            cell.getRow().update({"updated": false});
            $.ajax({
                url: issue_url,
                type: "PUT",
                data: JSON.stringify(posting_json),
                headers: {'X-Redmine-API-Key': apiKey},
                dataType: "text",
                contentType: 'application/json',
            })
            .done(function(data){
                //alert("Updated!");
                cell.getRow().update({"updated": true});
            })
            .fail(function(xhr, textStatus, errorThrown){
                alert("Failed: " + xhr.responseText);
            });
        },
    });

});
