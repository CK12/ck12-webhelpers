import time

class AccessDeniedException(Exception):
    pass

class GlobalLock(object):
    def __init__(self, rs, key="globallock", value='deadbolt', blocking=True, expires=10*60):
        """
        Distributed Global locking using Redis SET with NX and EX option introduced in Redis - 2.6.12.

        """
        lua_unlock = """
          if redis.call("get",KEYS[1]) == ARGV[1]
          then
              return redis.call("del",KEYS[1])
          else
              return 0
          end """

        self.rs = rs
        self.key = key
        self.value = value
        self.expires = expires
        self.blocking = blocking
        self.unlock_lua = rs.register_script(lua_unlock)

    def lock(self):
        while True:
            if self.rs.set(self.key, self.value, ex=self.expires, nx=True):
                return
            if not self.blocking:
                raise AccessDeniedException('[%s] lock is locked and [%s] is not the right key' %(self.key, self.value))
            time.sleep(1)
            continue

    def unlock(self):
        self.unlock_lua(keys=[self.key], args=[self.value])

    def __enter__(self):
        self.lock()

    def __exit__(self, exc_type, exc_value, traceback):
        self.unlock()
