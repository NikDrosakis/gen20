# database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings
MARIA_URL = f"mysql+pymysql://{settings.DB_USER}:{settings.DB_PASS}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.MARIA}"
MARIADMIN_URL = f"mysql+pymysql://{settings.DB_USER}:{settings.DB_PASS}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.MARIADMIN}"

# Create engine and session
engine_vivalibro = create_engine(MARIA_URL)
engine_admin = create_engine(DATABASE_ADMIN_URL)

SessionLocalVivalibro = sessionmaker(autocommit=False, autoflush=False, bind=engine_vivalibro)
SessionLocalGPM = sessionmaker(autocommit=False, autoflush=False, bind=engine_admin)

Base = declarative_base()

def fetch(table, id):
	mariac = conn.cursor(prepared=True)
	#mariac.execute(q)
	mariac.execute(f"SELECT * FROM {table} WHERE {table}=?",(id,))
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

