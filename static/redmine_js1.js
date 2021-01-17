// �e�[�}�̃��[�h�B���D�݂̂��̂��B
//$("head").append('<link href="https://unpkg.com/tabulator-tables@4.8.1/dist/css/tabulator.min.css" rel="stylesheet">'); // �W��
$("head").append('<link href="https://unpkg.com/tabulator-tables@4.8.1/dist/css/tabulator_simple.min.css" rel="stylesheet">'); // �V���v��
//$("head").append('<link href="https://unpkg.com/tabulator-tables@4.8.1/dist/css/bootstrap/tabulator_bootstrap.min.css" rel="stylesheet">'); // Bootstrap3

// Redmine���Bajax�Ŏ���Ă��邱�Ƃ��ł��邯�ǁA�y�[�W�ǂݍ��ݒx���Ȃ肻���Ȃ̂łƂ肠�����Œ�B
var INFO ={
 // /users.json ���ȉ��ɓ\��t�� ("total_count","offset","limit" �Ȃǂ͍폜���Ă�)
"users":[{"id":1,"login":"hono63","admin":true,"firstname":"N","lastname":"H","mail":"dummy@gmail.com","created_on":"2020-09-23T10:49:34Z","last_login_on":"2020-10-07T15:00:36Z"}]
, // /issue_statuses.json ���ȉ��ɓ\��t��
"issue_statuses":[{"id":1,"name":"�V�K","is_closed":false},{"id":2,"name":"�i�s��","is_closed":false},{"id":3,"name":"����","is_closed":false},{"id":4,"name":"�t�B�[�h�o�b�N","is_closed":false},{"id":5,"name":"�I��","is_closed":true},{"id":6,"name":"�p��","is_closed":true}]
, // /enumerations/issue_priorities.json ���ȉ��ɓ\��t��
"issue_priorities":[{"id":1,"name":"���","is_default":false,"active":true},{"id":2,"name":"�ʏ�","is_default":true,"active":true},{"id":3,"name":"����","is_default":false,"active":true},{"id":4,"name":"�}����","is_default":false,"active":true},{"id":5,"name":"������","is_default":false,"active":true}]
};

var apiKey = "";
$.get('/redmine/my/account').done(function(data){
    apiKey = $('#content > div.box > pre', $(data)).first().text();
});

// Tabulator��js��ǂݍ��݌�A�X�N���v�g���s
$.getScript("https://unpkg.com/tabulator-tables@4.8.1/dist/js/tabulator.min.js", function () {
    // �e�[�u�����ߍ���
    $('table.issues').after('<div id="tabulator-issues"></div>');

    // �����쐬
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

    // �e�[�u���̃w�b�_�쐬
    var tableHeader = [];
    $('table.issues').find('th').each(function(index, ele){
        let cls = $(ele).attr("class");
        if("checkbox hide-when-print" == cls){
            // do nothing
        }else if("buttons" == cls){
            // do nothing
        }else if("id" == cls){
            tableHeader.push({title:"#", field:"rid", frozen:true, editor:false, formatter:"html", formatter:function(cell, formatterParams, onRendered){ 
                // ID�Ƀ����N��t���邽�߂̃R�[���o�b�N�֐�
                let val = cell.getValue();
                return '<a href="/redmine/issues/' + val + '">' + val+ '</a>'; 
            }});
        }else if("project" == cls || "tracker" == cls || "updated_on" == cls){
            tableHeader.push({title:$(ele).text(), field:cls}); // project, tracker, �X�V����edit�֎~�Ƃ��� 
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

    // �e�[�u���̃f�[�^�쐬
    var tableData = [];
    $('table.issues > tbody').find('tr').each(function(tr_index, tr_ele){
        let a_data = {id: tr_index + 1};
        let is_description_row = false;
        $(tr_ele).find('td').each(function(index, ele){
            let cls = $(ele).attr("class");
            if("checkbox" == cls){
                // �ЂƂ܂�����
            }else if("description block_column" == cls){
                // �������B���̍s�͂ЂƂ܂�����
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

    // �e�[�u���B��
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
