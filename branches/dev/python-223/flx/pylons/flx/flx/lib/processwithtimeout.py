import time
import logging
import logging.handlers
import subprocess
import os
from tempfile import NamedTemporaryFile

## Initialize logging
def initLog():
    try:
        LOG_FILENAME = "process.log"
        log = logging.getLogger(__name__)
        log.setLevel(logging.DEBUG)
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
        handler.setFormatter(formatter)
        log.addHandler(handler)
        return log
    except:
        pass

class ProcessWithTimeout(object):
    """
        A wrapper around the subprocess module to allow killing the process after a timeout.
    """

    def __init__(self, cmd, cwd=None, shell=False, log=None):
        self.cmd = cmd
        self.cwd = cwd
        self.proc = None
        self.output = None
        self.error = None
        self.shell = shell
        self.log = log
        if not self.log:
            self.log = initLog()

    def start(self, timeout=300, input=None):
        outputFile = None
        errorFile = None
        inFile = None
        try:
            outputFile = NamedTemporaryFile(suffix=".out", delete=False)
            errorFile = NamedTemporaryFile(suffix=".err", delete=False)

            self.log.info("output: %s" % outputFile.name)

            timeSpent = 0
            if input:
                inFile = NamedTemporaryFile(suffix='.in', delete=True)
                inFile.write(input)
                inFile.seek(0)
                self.proc = subprocess.Popen(self.cmd, stdin=inFile, stdout=outputFile, stderr=errorFile, cwd=self.cwd, shell=self.shell)
            else:
                self.proc = subprocess.Popen(self.cmd, stdin=None, stdout=outputFile, stderr=errorFile, cwd=self.cwd, shell=self.shell)
            if timeout:
                while True:
                    time.sleep(1)
                    self.proc.poll()
                    if self.proc.returncode is not None:
                        break
                    timeSpent += 1
                    if timeSpent > timeout:
                        self.log.warning('Killing process because the timeout of %d seconds was exceeded.' % timeout)
                        self.proc.terminate()
                        self.proc.kill()
                        break
            else:
                self.proc.wait()

            outputFile.close()
            errorFile.close()

            if os.path.exists(outputFile.name):
                self.output = open(outputFile.name, "r").read()
                self.log.info("Output: %s" % self.output)

            if self.proc.returncode is not None:
                if self.proc.returncode != 0:
                    self.error = open(errorFile.name, "r").read()
                    self.log.error("Process failed with code: %d" % self.proc.returncode)
                    self.log.error("ERROR: %s" % self.error)
                    return self.proc.returncode
                else:
                    self.log.info("Process succeeded with returncode: %d" % self.proc.returncode)
                    return 0
            else:
                self.log.error("Process was killed since timeout %s secs exceeded." % timeout)
                return -1
        finally:
            try:
                if outputFile and not outputFile.closed:
                    outputFile.close()
                if errorFile and not errorFile.closed:
                    errorFile.close()
                if inFile and not inFile.closed:
                    ## Will delete automatically
                    inFile.close()
            finally:
                if os.path.exists(errorFile.name):
                    os.remove(errorFile.name)
                if os.path.exists(outputFile.name):
                    os.remove(outputFile.name)

