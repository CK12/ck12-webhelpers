from decorator import decorator as python_decorator
import MySQLdb
import settings

@python_decorator
def deal_db_conn(func, *args, **kwargs):
    db_obj = MySQLdb.connect(host=settings.DB_HOST, user=settings.DB_USER, passwd=settings.DB_PASSWD,db=settings.DATABASE)
    global cursor
    cursor = db_obj.cursor()
    try:
        return func(*args, **kwargs)
    finally:
        cursor.close()
        db_obj.close()
