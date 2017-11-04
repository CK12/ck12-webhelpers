from __future__ import with_statement
import time, logging

_logger = logging.getLogger(__name__)

class WallClock(object):
    def __init__(self, location_id, threshold=1.0, extra_info=None):
        """
        Caller location (location_id) is a string uniquely identified the instrumentation point.
        Elapsed time will only be logged if the threshold is 0 or the elapsed time exceeds the
        threshold (in seconds).
        """
        self.location_id = location_id
        self.threshold = threshold
        self.start_time = time.time()
        self.extra_info = extra_info

    def __enter__(self):
        return self.start_time

    def __exit__(self, exc_type, exc_val, exc_tb):
        elapsed = time.time() - self.start_time
        if not self.threshold or elapsed > self.threshold:
            _logger.warn("Wall clock [%s]: %.3f sec", self.location_id, elapsed)
            if self.extra_info:
                _logger.warn("Wall clock extra info: %s", self.extra_info)
        return False

def sqlQuote(name):
    """Quote an identifier name to avoid conflict with SQL reserved keywords"""
    return '`%s`' % name

