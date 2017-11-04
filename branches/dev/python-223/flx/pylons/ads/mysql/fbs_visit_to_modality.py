import MySQLdb

ADS_HOST = 'romer.ck12.org'
ADS_DB = 'ads'
ADS_DB_USER = 'dbuser'
ADS_DB_PASSWD = 'password'

FLX_HOST = 'romer.ck12.org'
FLX_DB = 'flx2'
FLX_DB_USER = 'dbuser'
FLX_DB_PASSWD = 'password'

AUTH_HOST = 'lilyserver.ck12.org'
AUTH_DB = 'auth'
AUTH_DB_USER = 'dbuser'
AUTH_DB_PASSWD = 'password'

all_user_info = {}
con_eids = {}


def get_db_conn(host, user, passwd, db):
    db_conn = MySQLdb.connect(host=host, user=user, passwd=passwd,db=db)
    return db_conn

def get_context_eids_from_flx(artifact_ids):
    db_conn1 = get_db_conn(FLX_HOST, FLX_DB_USER, FLX_DB_PASSWD, FLX_DB)
    cursor = db_conn1.cursor()
    query = 'select ral.id,ral.domainEID,at.name from ArtifactTypes at join (select * from RelatedArtifactsAndLevels where '
    for i in range(len(artifact_ids)):
        query += 'id=%s '%artifact_ids[i]
        if i != len(artifact_ids) -1 :
            query += 'or '
    query += ') ral on ral.artifactTypeID=at.id;'
    cursor.execute(query)
    context_eids = cursor.fetchall()
    cursor.close()
    db_conn1.close()
    if context_eids:
        resulting_dict = {}
        for each in context_eids:
            resulting_dict[each[0]] = {'context_eid' : each[1] , 'modality_type' : each[2]}
        context_eids = resulting_dict
    else:
        context_eids = None
    return context_eids
        
def get_context_eids(artifact_ids):
    db_conn1 = get_db_conn(ADS_HOST, ADS_DB_USER, ADS_DB_PASSWD, ADS_DB)
    cursor = db_conn1.cursor()
    query = 'select artifactID,context_eid,modality_type from F_modality where (context_eid != "" or context_eid != NULL) and ('
    for i in range(len(artifact_ids)):
        query += 'artifactID=%s '%artifact_ids[i]
        if i != len(artifact_ids) -1 :
            query += 'or '
    query += ') group by artifactID'
    cursor.execute(query)
    context_eids = cursor.fetchall()
    cursor.close()
    db_conn1.close()
    if context_eids:
        resulting_dict = {}
        for each in context_eids:
            resulting_dict[each[0]] = {'context_eid' : each[1] , 'modality_type' : each[2]}
        context_eids = resulting_dict
    else:
        context_eids = None
    missing_ids = list(set(artifact_ids) - set(context_eids))
    missing_con_eids = None
    if missing_ids:
        missing_con_eids = get_context_eids_from_flx(missing_ids)
    if missing_con_eids:
        context_eids.update(missing_con_eids)
    return context_eids

def get_user_roles(user_ids):
    db_conn1 = get_db_conn(ADS_HOST, ADS_DB_USER, ADS_DB_PASSWD, ADS_DB)
    cursor = db_conn1.cursor()
    query = 'select userID,user_role from F_modality where '
    for i in range(len(user_ids)):
        query += 'userID=%s '%user_ids[i]
        if i != len(user_ids) -1 :
            query += 'or '
    query += ' group by userID'
    cursor.execute(query)
    member_info = cursor.fetchall()
    cursor.close()
    db_conn1.close()
    if member_info:
        member_info = dict(member_info)
    else:
        member_info = None
    missing_ids = list(set(user_ids) - set(member_info.keys()))
    missing_member_info = None
    if missing_ids:
        missing_member_info = get_user_roles_from_auth(missing_ids)
    if missing_member_info:
        member_info.update(missing_member_info)
    return member_info


def get_user_roles_from_auth(user_ids):
    db_conn1 = get_db_conn(AUTH_HOST, AUTH_DB_USER, AUTH_DB_PASSWD, AUTH_DB)
    cursor = db_conn1.cursor()
    query = 'select m.memberID,mr.name from MemberRoles mr join (select * from MemberHasRoles where '
    for i in range(len(user_ids)):
        query += 'memberID=%s '%user_ids[i]
        if i != len(user_ids) -1 :
            query += 'or '
    query += ') m on m.roleID=mr.id;'
    cursor.execute(query)
    member_info = cursor.fetchall()
    cursor.close()
    db_conn1.close()
    if member_info:
        member_info = dict(member_info)
    else:
        member_info = None
    return member_info

def get_rows_from_fbs_visit(num_of_rows):
    db_conn = get_db_conn(ADS_HOST, ADS_DB_USER, ADS_DB_PASSWD, ADS_DB)
    cur = db_conn.cursor()
    
    min_ts_query = 'select min(ts) from F_modality'
    cur.execute(min_ts_query)
    res = cur.fetchone()
    min_tm = res[0].strftime('%Y-%m-%d %H:%M:%S')
    
    query = 'select ts,dateID,artifactID,revisionID,userID,visited from F_fbs_visit where ts < "%s" order by ts desc limit %s' % (min_tm,num_of_rows)
    cur.execute(query)
    rows = cur.fetchall()
    if not rows:
        return None 
    lst = []
    user_ids = []
    for k in range(len(rows)):
        if rows[k][2] and (not con_eids.keys().__contains__(rows[k][2]) or not lst.__contains__(rows[k][2])):
            lst.append(rows[k][2])
        if rows[k][4] and (not all_user_info.keys().__contains__(rows[k][4]) or not user_ids.__contains__(rows[k][4])):
            user_ids.append(rows[k][4])
        
    if lst:
        context_eids = get_context_eids(lst)
    else:
        context_eids = None
    if context_eids:
        con_eids.update(context_eids)
    user_info = None
    if user_ids:
        user_info = get_user_roles(user_ids)
    if user_info:
        all_user_info.update(user_info)

    cur.close()
    db_conn.close()
    return rows

def prepare_fbs_visit_for_modality(rows):
    new_rows = []
    for each in rows:
        visited = each[5]
        artifact_id = each[2]
        user_id = each[4]
        if con_eids.has_key(artifact_id):
            context_eid = con_eids[artifact_id]['context_eid']
            modality_type = con_eids[artifact_id]['modality_type']
        else:
            context_eid = ''
            modality_type = ''
        if all_user_info.has_key(user_id):
            user_role = all_user_info[user_id]
        else:
            user_role = ''
        each = list(each)
        each[5] = modality_type
        if not each[4]:
            each[4] = 'NULL'
        each.extend([context_eid, user_role, visited, 'NULL','NULL','NULL'])
        new_rows.append(each)
    return new_rows

def insert_rows_to_modality(rows):
    db_conn = get_db_conn(ADS_HOST, ADS_DB_USER, ADS_DB_PASSWD, ADS_DB)
    cur = db_conn.cursor()
    
    for each in rows:
        query = 'insert into F_modality(ts, dateID, artifactID, revisionID, userID, modality_type, context_eid, user_role, visited, shared, clicked, time_spent) values ("%s", %s, %s, %s, %s, "%s", "%s","%s", %s, %s, %s, %s)'%(each[0],each[1],each[2],each[3],each[4],each[5],each[6],each[7],each[8],each[9],each[10],each[11])
        cur.execute(query)
    db_conn.commit()
    cur.close()
    db_conn.close()

if __name__ == "__main__":
  while True:
    print "Fetching rows from F_fbs_visit"
    rows = get_rows_from_fbs_visit(10)
    if not rows:
        print "END OF THE ROWS, exiting.."
        break
    print "done"
    print "\nPreparing rows for F_modality"
    rows = prepare_fbs_visit_for_modality(rows)
    print "done"
    print "\nInserting the rows into F_modality"
    insert_rows_to_modality(rows)
    print "done\n"
