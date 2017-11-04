#!/usr/bin/python

from multiprocessing import Process
import settings
import os, time

class GenericProcessPool(object):
    def __init__(self):
        self.process_pool = []
        self.max_process_count = settings.MAX_PROCESS_COUNT

    def start_diff_processes(self, target_arg_list):
        each_ind = 0
        while each_ind != (len(target_arg_list)):
            each = target_arg_list[each_ind]
            if self.current_running_process_count() < self.max_process_count: 
                p = Process(target=each['target'], args=each['args'])
                p.start()
                self.process_pool.append(p)
                each_ind = each_ind + 1
            else:
                time.sleep(settings.STATUS_CHECK_WAIT_TIME)

    def current_running_process_count(self):
        process_count = 0
        try:
            if len(self.process_pool) > 0:
                for each_process in self.process_pool:
                    if each_process.is_alive():
                        process_count += 1 
        except Exception as e:
            print "current_running_process_count: %s"% e.__str__()
        return process_count
 
    def cleanup_processes(self):
        try:
            if self.process_pool:
                tmp_list = []
                tmp_list.extend(self.process_pool)
                for each in self.process_pool:
                    if each.pid in to_remove:
                         self.process_pool.remove(each)
        except Exception as e:
            print 'Error in cleanup_processes: %s'% e.__str__()

    def wait_for_all_processes(self):
        if not self.process_pool: 
            return
        else:
            for each_process in self.process_pool:
                each_process.join()
    
