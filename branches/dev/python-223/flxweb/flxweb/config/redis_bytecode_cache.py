import logging
from jinja2 import BytecodeCache
from redis import Redis
log = logging.getLogger( __name__ ) 
 
class RedisBytecodeCache(BytecodeCache):
    """bytecode cache on redis for jinja2
    """
    def __init__(self, host='localhost', port=6379, db=0, expire=0):
        self._conn = Redis(host=host, port=port, db=db)
        self._expire = int(expire)
 
    def load_bytecode(self, bucket):
        log.info("load bytecode key='%s'" % bucket.key)
        code = self._conn.get(bucket.key)
        if code is not None:
            return bucket.bytecode_from_string(code)
 
    def dump_bytecode(self, bucket):
        if self._expire:
            self._conn.expire(bucket.key, self._expire)
        self._conn.set(bucket.key, bucket.bytecode_to_string())
 
    def clear(self):
        self._conn.delete(*self._conn.keys())
