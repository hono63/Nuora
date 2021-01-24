"""
Run Editor server by using Flask
"""

import json
import copy
#from npito import open_folder
from flask import Flask, render_template, redirect, request, jsonify
from appdb import db, create_app
from dbctrl import DBCtrl
from models import User, Tweet

app = create_app()
dbc = DBCtrl(db)
MODELNAME = {"User": User, "Tweet": Tweet}

@app.route('/')
def route():
    return "<h1>hello</h1>"

@app.route('/index', methods=["GET", "POST"])
def index():
    userlist  = dbc.get_json_list(User)
    tweetlist = dbc.get_json_list(Tweet)
    # 親子紐付け
    id2index  = {}
    for idx, twt in enumerate(tweetlist):
        id2index[twt["id"]] = idx
    for twt in tweetlist:
        if twt.get("toid", None) is not None:
            toidx = id2index[twt["toid"]]
            if "_children" in tweetlist[toidx]:
                tweetlist[toidx]["_children"].append(copy.deepcopy(twt))
            else:
                tweetlist[toidx]["_children"] = [copy.deepcopy(twt)]
    tweetlist2 = [twt for twt in tweetlist if twt.get("toid", None) is None] # 親だけのリスト
    for twt in tweetlist2:
        if "_children" in twt:
            twt["_children"].sort(key=lambda x: x["created"]) # 子供は昇順でソート
    #print(userslist)
    return render_template("index.html", users=userlist, tweets=tweetlist2)

@app.route('/update-data', methods=["POST"])
def update_data():
    status = 200
    upd_data = {}
    json_data = copy.copy(request.form)
    model = MODELNAME[json_data["modelname"]]
    if "flag_addupd" in json_data:
        upd_data = dbc.add(model, json_data) # add or update
    elif "flag_delete" in json_data:
        dbc.delete(model, json_data["id"])
        upd_data = {"id": json_data["id"]}
    else:
        status = 400
    return jsonify({"updated_data": upd_data}), status

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=2777, debug=True)

