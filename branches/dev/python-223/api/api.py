#!/usr/bin/env python

# [[file:~/prg/scm/api/TODO.org::*Flask-restless][Flask-restless:1]]

import os

import flask
import flask.ext.sqlalchemy
import flask.ext.restless

# import logging, sys, os
# logging.basicConfig(stream=sys.stderr)
# logging.error(os.environ)

app = flask.Flask(__name__)
app.config['DEBUG'] = True

app.config['SQLALCHEMY_DATABASE_URI'] = \
    'mysql://{user}:{password}@{host}/{db}'.format(
        user=os.environ['CK12_USER'],
        password=os.environ['CK12_PASSWORD'],
        host=os.environ['CK12_HOST'],
        db=os.environ['CK12_API_DB'])
db = flask.ext.sqlalchemy.SQLAlchemy(app)

ApplicationPath = db.Table('application_path',
         db.Column('application_id',db.Integer,db.ForeignKey('application.id')),
         db.Column('path_id',db.Integer,db.ForeignKey('path.id'))
)

class Path(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    mask = db.Column(db.String(255))

class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    email = db.Column(db.String(320))
    hash = db.Column(db.String(255), unique=True)
    paths = db.relationship('Path',secondary=ApplicationPath,backref=db.backref('applications'),lazy='dynamic')
    
db.create_all()

manager = flask.ext.restless.APIManager(app, flask_sqlalchemy_db=db)
manager.create_api(Application, methods=['GET', 'PUT','POST', 'DELETE'], allow_patch_many=True,results_per_page=50)
manager.create_api(Path, methods=['GET', 'PUT', 'POST', 'DELETE'], allow_patch_many=True,results_per_page=100)

# if __name__ == '__main__':
#     app.run()

# Flask-restless:1 ends here
