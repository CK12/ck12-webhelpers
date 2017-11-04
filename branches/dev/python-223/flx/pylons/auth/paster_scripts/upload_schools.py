import os
import csv
import re

from auth.model import api

def run(schools_type, csv_path):
    if os.path.splitext(csv_path)[1] != '.csv':
        print 'Error: Expected csv file. Got %s' % os.path.splitext(csv_path)[1]
        return

    if not os.path.isfile(csv_path):
        print 'Error: File %s could not be found' % csv_path
        return

    if schools_type not in ('public', 'private'):
        print 'Error: Schools type argument can be public or private'
        return

    master_columns = {
        'public': {
            'School Name': 'SCHOOL_NAME',
            'School ID - NCES Assigned [Public School] Latest available year': 'SCHOOL_ID',
            'County Name [Public School] 2010-11': 'COUNTY_NAME',
            'Location Address [Public School] 2010-11': 'ADDRESS',
            'Location City [Public School] 2010-11': 'CITY',
            'State Name [Public School] Latest available year': 'STATE_NAME',
            'Location State Abbr [Public School] 2010-11': 'STATE_ABBR',
            'Location ZIP [Public School] 2010-11': 'ZIP',
        },

        'private': {
            'Private School Name': 'SCHOOL_NAME',
            'School ID - NCES Assigned [Private School] Latest available year': 'SCHOOL_ID',
            'County Name [Private School] 2009-10': 'COUNTY_NAME',
            'Mailing Address [Private School] 2009-10': 'ADDRESS',
            'City [Private School] 2009-10': 'CITY',
            'State Name [Private School] Latest available year': 'STATE_NAME',
            'State Abbr [Private School] Latest available year': 'STATE_ABBR',
            'ZIP [Private School] 2009-10': 'ZIP',
        }
    }

    columns = {
        'SCHOOL_NAME': 999,
        'SCHOOL_ID': 999,
        'COUNTY_NAME': 999,
        'ADDRESS': 999,
        'CITY': 999,
        'STATE_NAME': 999,
        'STATE_ABBR': 999,
        'ZIP': 999,
    }

    col_names = ['SCHOOL_NAME', 'SCHOOL_ID', 'COUNTY_NAME', 'ADDRESS', 'CITY', 'STATE_NAME', 'STATE_ABBR', 'ZIP']

    with open(csv_path, 'rb') as csvfile:
        i = 0
        reader = csv.reader(csvfile, dialect='excel')
        for row in reader:
            i = i + 1
            if i < 7:
                continue
            elif i == 7:
                j = 0
                k = 0
                master_cols = master_columns[schools_type]
                keys = master_cols.keys()
                for r in row:
                    if r in keys:
                        columns[master_cols[r]] = j
                        k = k + 1
                    j = j + 1
                if k != len(col_names):
                    print 'Error: Not all coulmns could be mapped. Columns: %s' % str(columns)
                    return
            else:
                if row[0] == 'Totals:':
                    break
                r = []
                no_addr = False
                for c in col_names:
                    d = row[columns[c]].decode('utf-8')
                    m = re.match('^="(.*)"', d)
                    if m is not None:
                        d = m.groups()[0]
                    if c == 'STATE_ABBR' and len(d) != 2:
                        no_addr = True
                    r.append(d)

                if no_addr:
                    for k in [2, 3, 4, 5, 6, 7]:
                        r[k] = '' if len(r[k]) == 1 else r[k]

                #name, nces_id, address, city, state, zipcode, county
                #'SCHOOL_NAME', 'SCHOOL_ID', 'COUNTY_NAME', 'ADDRESS', 'CITY', 'STATE_NAME', 'STATE_ABBR', 'ZIP'
                api.addUSSchoolsMaster(r[0], r[1], r[3], r[4], r[6], r[7], r[2]) 
                '''
                street_num = ''
                street1 = ''
                city = r[4]
                state = r[6]
                zip = r[7]

                addr = r[3]
                if ' ' in addr:
                    a = addr.split(' ', 1)
                    if a[0].isdigit():
                        street_num = a[0]
                        street1 = a[1]
                    else:
                        street1 = addr
                print [street_num, street1, city, state, zip, addr]
                '''
                print r
