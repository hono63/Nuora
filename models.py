
from appdb import db
import uuid
import datetime

def json_serializer(model, instance):
    jdata = {}
    for k,v in model.__dict__.items():
            #print(jdata)
            if k in model.ColInt:
                jdata[k] = getattr(instance, k)
            elif k in model.ColStr:
                jdata[k] = getattr(instance, k)
    return jdata

class User(db.Model):
    id   = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    ColInt = ("id")
    ColStr = ("name")
    def __repr__(self):
        return '<User %s>' % self.name
    def add_cb(self):
        pass
    def update_cb(self):
        pass

class Tweet(db.Model):
    id      = db.Column(db.Integer, primary_key=True)
    kind    = db.Column(db.Integer)
    tweet   = db.Column(db.String)
    userid  = db.Column(db.Integer)
    toid    = db.Column(db.Integer)
    eene    = db.Column(db.Integer)
    created = db.Column(db.String)
    ColInt = ("id", "kind", "userid", "toid", "eene")
    ColStr = ("tweet", "created")
    def __repr__(self):
        return '<Spec %s>' % self.name
    def add_cb(self):
        self.created = str(datetime.datetime.now().strftime("%Y/%m/%d %H:%M"))
    def update_cb(self):
        pass


KIND = {
    1: "kizuki",
    2: "question",
}