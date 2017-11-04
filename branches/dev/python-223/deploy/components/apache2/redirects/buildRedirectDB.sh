rm redirects.csv redirects.sqlite
cat csvs/*.csv > redirects.csv
sqlite3 redirects.sqlite < redirectCSVImport.sql
