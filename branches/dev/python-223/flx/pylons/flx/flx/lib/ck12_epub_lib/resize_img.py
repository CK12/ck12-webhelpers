#!/usr/bin/python

import os
import sys

def auto_resize_image(image_path, file_name, size_parameter):
    source_path = image_path +"/"+ file_name
    dest_path = image_path +"/"+ file_name +"__"
    cmd="convert "+ source_path +" -resize "+ size_parameter +" "+ dest_path
    a = os.system(cmd)   
    if (a == 0) :
        cmd2 = "mv "+ dest_path +" "+ source_path
        os.system(cmd2)


def auto_resize_image_in_dir(path):  
    image_list = os.listdir(path)
    for file in image_list:
        auto_resize_image(path, file, "1024x1024\\>")
        

if __name__ == "__main__":
   auto_resize_image_in_dir(sys.argv[1])
   