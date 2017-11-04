api_host = 'localhost'
email_host = 'localhost'
machine_name = 'localhost'

tool_home_path = '/opt/2.0/flx/scripts/api_compatibility_checker'
reference_file = '%s/support_files/reference_baseline.txt'%tool_home_path
log_file = '%s/support_files/acc.log'%tool_home_path
api_list_file = '%s/input_api_files/api_list.cfg'%tool_home_path

sender = ''
emails_to_notify = []

dynamic_keys = ['book','chapter','concept','lesson','section','tebook','workbook','labkit','studyguide','allAttachments','allVideos','contents','cover page','epub','epubk','mobi','pdf']
