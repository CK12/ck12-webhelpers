import redis
from itertools import izip_longest
import logging, logging.handlers

redis_host = 'qa-redis-vpc-001.rem9jn.0001.use1.cache.amazonaws.com'
redis_port = 6379
redis_db = 0
batch_size = 5000

log_filename = "/tmp/redis_stats.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(log_filename, maxBytes=10*1024*1024, backupCount=30)
#handler = logging.StreamHandler()
#handler = logging.StreamHandler()
handler.setFormatter(formatter)
log.addHandler(handler)

def batcher(iterable, n):
    args = [iter(iterable)] * n
    return izip_longest(*args)


def run():
    rs = redis.Redis(host=redis_host, port=redis_port, db=redis_db)

    count = 0
    function_info = {}
    for keys in batcher(rs.scan_iter('*'), batch_size):
        for each_key in keys:
            key_parts = each_key.split(':')
            rs_broker = key_parts[0]
            if rs_broker != 'beaker':
                continue
            function_path = key_parts[1]
            if function_path.startswith('/'):
                function_name = function_path.split('|')[1]
            else:
                function_name = function_path
            value_length = rs.strlen(each_key)
            key_ttl = rs.ttl(each_key)
            if not key_ttl or key_ttl < 0:
                key_ttl = 0
            #print function_name, rs.strlen(each_key), rs.ttl(each_key)
            if function_name not in function_info:
                function_info[function_name] = {'No Of Keys':1, 'No Of Immortal Keys':0, 'Total Size': value_length, 'TTL': key_ttl}
                if key_ttl == 0:
                    function_info[function_name]['No Of Immortal Keys'] = 1
            else:
                function_info[function_name]['No Of Keys'] += 1
                function_info[function_name]['Total Size'] += value_length
                function_info[function_name]['TTL'] += key_ttl
                if key_ttl == 0:
                    function_info[function_name]['No Of Immortal Keys'] += 1
            if function_info[function_name]['No Of Keys'] == function_info[function_name]['No Of Immortal Keys']:
                function_info[function_name]['Average TTL (Days)'] = 'Never Expires'
            else:
                function_info[function_name]['Average TTL (Days)'] = (function_info[function_name]['TTL'] / float(function_info[function_name]['No Of Keys'] - function_info[function_name]['No Of Immortal Keys']))/(60*60*24)
        count += 1
        #if count > 3:
        #    break
        log.info('Done analyzing [%d] keys' %(batch_size*count))
    for function, stats in function_info.items():
        log.info('\n' + function)
        log.info('-'*100)
        log.info("{:<20} {:<10}".format('Stats','Value'))
        for k, v in stats.items():
            if k != 'TTL': 
                log.info("{:<20} {:<10}".format(k, v))
        log.info('-'*47 + 'END' + '-'*47)


if __name__ == '__main__':
    run()
