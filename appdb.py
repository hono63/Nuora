
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()

def create_app():
    """appを生成して返す
    参考 https://flask-sqlalchemy.palletsprojects.com/en/2.x/api/
    """
    app = Flask("Nuora")
    # SQLite3を使う
    #app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///data.sqlite3"
    # PostgreSQLを使う user:password@host/name という書式。
    app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql+psycopg2://hono63:p@ssword@127.0.0.1/nuoradb"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    migrate = Migrate(app, db)
    return app