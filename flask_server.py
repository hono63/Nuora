"""
Run Editor server by using Flask
"""

import json
import copy
#from npito import open_folder
from flask import Flask, render_template, redirect, request, jsonify
from appdb import app, db
from dbctrl import DBCtrl
from models import User, Tweet

dbc = DBCtrl(db)
MODELNAME = {"User": User, "Tweet": Tweet}

@app.route('/')
def route():
    return "<h1>hello</h1>"

@app.route('/index', methods=["GET", "POST"])
def index():
    userlist  = dbc.get_json_list(User)
    tweetlist = dbc.get_json_list(Tweet)
    #print(userslist)
    return render_template("index.html", users=userlist, tweets=tweetlist)

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

