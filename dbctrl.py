# データベースの操作を行う

from models import User, Tweet, json_serializer
import uuid

class DBCtrl():
    def __init__(self, db):
        self.db = db
        #self.db.create_all()
        # sample
        #self.add(User, {"name": "Junsuke"})
        #self.add(Tweet, {"tweet": "Hello"})
    def get_json_list(self, model):
        datalist = []
        for instance in self.db.session.query(model):
            datalist.append(json_serializer(model, instance))
        return datalist
    def add(self, model, a_json):
        if "id" in a_json:
            # 更新
            instance = self.db.session().query(model).filter(model.id == a_json["id"]).first()
            for k,v in a_json.items():
                if k in model.ColInt and v != "":
                    setattr(instance, k, int(v))
                elif k in model.ColStr:
                    setattr(instance, k, str(v))
            instance.update_cb()
        else:
            # 新規追加
            a_json2 = {}
            for k,v in a_json.items():
                if k in model.ColInt:
                    a_json2[k] = int(v)
                elif k in model.ColStr:
                    a_json2[k] = str(v)
            instance = model(**a_json2)
            instance.add_cb()
        self.db.session.add(instance)
        self.db.session.commit()
        return json_serializer(model, instance)
    def delete(self, model, id):
        instance = self.db.session.query(model).filter(model.id == id).first()
        self.db.session.delete(instance)
        self.db.session.commit()

