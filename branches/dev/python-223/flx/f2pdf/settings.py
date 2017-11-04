import os

HOSTNAME = 'https://romer.ck12.org'
ImgFloat = True

if not HOSTNAME:
    HOSTNAME = r"https://" + os.uname()[1] + r".ck12.org"

