from distutils import dir_util

#provides standard functionalities, and the default stubs to be overiden by
#specific implementation drivers. 
#The drivers task is to take the raw payload and translate it to latex bundle 
#that is ready to be rendered to PDF 
class BaseDriver:
    def __init__(self):
        #each driver should have a unique template dir... also use common_dir/contents for common images
        # and Latex macros
        self.template_dir = ""
        self.common_dir = ""
        self.work_dir = ""
        self.art_type = ""
        self.payload_dir = ""
        self.logger = None


    def initiate_logger (self, logger):
        self.logger = logger

    def set_work_dir(self, work_dir):
        self.work_dir = work_dir

    def set_payload_dir(self, payload_dir):
        self.payload_dir = payload_dir

    # Move the needed files to a working directory
    def prepare_template(self):
        if self.work_dir != "" and self.template_dir !="":
            dir_util.copy_tree(self.template_dir, self.work_dir)

        if self.work_dir != "" and self.common_dir !="":
            dir_util.copy_tree(self.common_dir, self.work_dir)

        if self.payload_dir !="" and self.payload_dir != self.work_dir:
            dir_util.copy_tree(self.payload_dir, self.work_dir)

    #Translate payload from xhtml to latex        
    def translate(self):
        pass

    #Substitue values from metadata/payload to document template.
    #overide at implementation class
    def substitute(self):
        pass

    #This is the method that will be called by main code. 
    #all the specific driver implementation detail should be run from here.    
    def do_work(self):
        pass
