# -*- coding: utf-8 -*-
import mariadb
import sys
from typing import Union
from pydantic import BaseModel

class Book(BaseModel):
 title: str
 author: str

# Connect to MariaDB Platform
try:
    conn = mariadb.connect(
        user="root",
        password="n130177!",
        host="127.0.0.1",
        port=3306,
        database="ga_240204"

    )
except mariadb.Error as e:
    print(f"Error connecting to MariaDB Platform: {e}")
    sys.exit(1)

# Get Cursor

def switchid(table):
    switch_dict  = {
        'post': 'id',
        'user': 'id',
        'tax': 'id',
        'globs': 'name',
    }
    return switch_dict.get(table, 'post')


def fetch(table, id):
	mariac = conn.cursor(prepared=True)
	#mariac.execute(q)
	key = switchid(table)
	mariac.execute(f"SELECT * FROM {table} WHERE {key}=?",(id,))
	row = mariac.fetchone()
	mariac.close()
	return row

def fetchall(table):
	mariac = conn.cursor(prepared=True)
	mariac.execute(f"SELECT * FROM {table} ")
#	mariac.execute(q)
	row = mariac.fetchall()
	mariac.close()
	return row
	
def insert(q,args):
	mariac = conn.cursor(prepared=True)
	mariac.execute(q, args)
	mariac.commit()
	if mariac.lastrowid:
		return mariac.lastrowid
	else:
		return false
	mariac.close()
def update(q,args):
	mariac = conn.cursor(prepared=True)
	mariac.execute(q, args)
	mariac.commit()
	if mariac.lastrowid:
		return mariac.lastrowid
	else:
		return false
	mariac.close()
def delete(q,args):
	mariac = conn.cursor(prepared=True)
	mariac.execute(q, args)
	mariac.commit()
	if mariac.lastrowid:
		return mariac.lastrowid
	else:
		return false
	mariac.close()

