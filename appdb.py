
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask("Editor2777")

app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///data.sqlite3"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
