import sys, random
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import logging
log = logging.getLogger('sqlalchemy.engine')
log.level = logging.WARN

if len(sys.argv) == 2:
    dbhost = sys.argv[1]
else:
    dbhost = 'localhost'

engine = create_engine('mysql://dbadmin:D-coD#43@%s:3306/ads?charset=utf8' % dbhost, echo=False)
Session = sessionmaker(bind=engine)
session = Session()


CONCEPTS_ATTEMPTED = 25
QUESTIONS_ATTEMPTED = 5
MAX_ATTEMPTS = 5

mathConcepts = [i[0] for i in session.execute('select distinct b.conceptID from D_books b, flx2.Artifacts a, flx2.ArtifactTypes t where b.tag = "Mathematics" and b.conceptID=a.id and a.artifactTypeID=t.id and t.name="concept"').fetchall()]
otherConcepts = [i[0] for i in session.execute('select distinct b.conceptID from D_books b, flx2.Artifacts a, flx2.ArtifactTypes t where b.tag <> "Mathematics" and b.conceptID=a.id and a.artifactTypeID=t.id and t.name="concept"').fetchall()]

concepts = mathConcepts[:CONCEPTS_ATTEMPTED/2]
for i in otherConcepts:
    if i not in concepts:
        concepts.append(i)
    if len(concepts) >= CONCEPTS_ATTEMPTED:
        break

questions = session.execute('select id, "declarative", difficultyLevel from homeworkpedia.DeclarativeQuestion where isValid="T" and approvedBy is not null').fetchall()
questions.extend(session.execute('select id, "generative", difficultyLevel from homeworkpedia.GenerativeQuestion where isValid="T" and approvedBy is not null').fetchall())
random.shuffle(questions)

demoUsers = [
    ('andysmith@ck12.org', 'student', 'Andy', 'Smith'), 
    ('alexwhite@ck12.org', 'student', 'Alex', 'White'), 
    ('marydavis@ck12.org', 'teacher', 'Mary', 'Davis')]
students = []

msg = "Populating student(s) and teacher users for ADS demo"
print msg; log.debug(msg)

for email, role, first, last in demoUsers:
    if not session.execute('select id from flx2.Members where email="%s"' % email).fetchall():
        session.execute('insert into flx2.Members (stateID, login, defaultLogin, email, givenName, surname, creationTime, updateTime) values (2, "%s", "%s", "%s", "%s", "%s", NOW(), NOW())' % (email, email, email, first, last))
        userID = session.execute('select id from flx2.Members where email="%s"' % email).fetchone()[0]
        roleID, groupID = session.execute('select id, groupID from flx2.MemberRoles where name="%s"' % role).fetchone()
        session.execute('insert into flx2.GroupHasMembers (groupID, memberID, roleID) values (%s, %s, %s)' % (groupID, userID, roleID))
        session.execute('insert into flx2.MemberExtData (memberID, authTypeID, token) values(%s, 1, "sha256:7d5fc:89181c9bf3c854410baac5748cdfa2dfe0975dc86af8aa0c80ee1367726c34f2")' % userID)
        session.commit()
        msg = 'Created user %s' % email
        print msg; log.debug(msg)

for email, role, first, last in demoUsers:
    if role == 'student':
        userID = session.execute('select id from flx2.Members where email="%s"' % email).fetchone()[0]
        students.append(userID)


msg = "Populating F_exercise and F_fbs_time_spent of random mastery level records for students"
print msg; log.debug(msg)

dates = [i[0] for i in session.execute('select dateID from D_time where `date` >= date_sub(curdate(), interval 2 day) and `date` <= date_add(curdate(), interval 20 day) order by id desc').fetchall()]
d = dates[-1]

recordsCreated = 0
for u in students:
    F_exercise_records, F_fbs_time_records = 0, 0
    for c in concepts[:CONCEPTS_ATTEMPTED]:
        for q in questions[:QUESTIONS_ATTEMPTED]:
            for i in xrange(1, random.randint(1, MAX_ATTEMPTS)):
                dice = random.randint(1, 100)
                correctness = 'correct' if dice <= 55 else 'wrong' if dice <= 70 else 'skipped'
                F_exercise_exe = session.execute('insert into F_exercise (dateID, userID, artifactID, question_id, question_type, difficulty_level, confidence_level, correct, wrong, skipped, hint, time_spent) ' \
                    'values (%s, %s, %s, %s, "%s", "%s", "%s", %s, %s, %s, %s, %s)' %
                    (d, u, c, q[0], q[1], q[2], 'Medium', correctness == 'correct', correctness == 'wrong', correctness == 'skipped', random.choice([1,0,1,0,1,0,0]), random.choice([1,2,3,4,5,6,7,8,9])))
                F_exercise_records += F_exercise_exe.rowcount
                F_fbs_time_exe = session.execute('insert into F_fbs_time_spent (dateID, userID, artifactID, duration) ' \
                    'values (%s, %s, %s, %s)' %
                    (d, u, c, random.choice([t for t in xrange(1, 100, 10)])))
                F_fbs_time_records += F_fbs_time_exe.rowcount
                recordsCreated += F_exercise_records + F_fbs_time_records
    if F_exercise_records or F_fbs_time_records:
        msg = '%d F_exercise and %d F_fbs_time_spent records have been created for user %d' % (F_exercise_records, F_fbs_time_records, u)
        print msg; log.debug(msg)
if not recordsCreated:
    msg = 'NOTE: No F_exercise nor F_fbs_time_spent records created.  Possible reason: %d concepts, %d questions found.' % (len(concepts), len(questions))
    print msg; log.warn(msg)


msg = "Populating records into F_exercise to simulate 90% mastery towards a concept for students"
print msg; log.debug(msg)

questions = []
for conceptID, eid in session.execute('select a.id, a.encodedID from flx2.Artifacts a, D_artifacts d where a.id=d.artifactID and d.tag="Mathematics"').fetchall():
    # Make sure concept has next step
    rs = session.execute('select count(*) from ArtifactsBrowseTerms ab, taxonomy.ConceptNodes n, taxonomy.ConceptNodeNeighbors nb, taxonomy.ConceptNodes n2, ArtifactsBrowseTerms ab2'
                         ' where ab.id=%s and ab.encodedID=n.encodedID and nb.requiredConceptNodeID=n.id and nb.conceptNodeID=n2.id and n2.encodedID=ab2.encodedID' % conceptID).fetchall()
    if not (rs and rs[0] and rs[0][0]):
        continue

    parts = eid.split('.') 
    parts[-2] = 'X'
    eeid = '.'.join(parts)
    questions = [i[0] for i in session.execute('select q.id from homeworkpedia.ExerciseBundle b, homeworkpedia.BundleHasQuestions q where b.id=q.bundleID and b.encodedID="%s"' % eeid).fetchall()]
    if questions and len(questions) >= 20:
        break

recordsCreated = 0
for u in students:
    recordsCreated = 0
    for q in questions:
        exe = session.execute('insert into F_exercise (dateID, userID, artifactID, question_id, question_type, difficulty_level, confidence_level, correct, wrong, skipped, hint, time_spent) ' \
            'values (%s, %s, %s, %s, "declarative", "normal", "Medium", 1, null, null, null, 1)' %
            (d, u, conceptID, q))
        recordsCreated += exe.rowcount
    if recordsCreated:
        msg = '%d F_exercise records have been created for user %d for >90% mastery' % (recordsCreated, u)
        print msg; log.debug(msg)
if not recordsCreated:
    msg = 'NOTE: No F_exercise records created.  Possible reason: Unable to locate concept record or questions.'
    print msg; log.warn(msg)

session.commit()


msg = "Populating another user who spent time reading but didn't answer any exercises"
print msg; log.debug(msg)

demoUsers = [('janesmith@ck12.org', 'student', 'Jane', 'Smith')]
students = []

for email, role, first, last in demoUsers:
    if not session.execute('select id from flx2.Members where email="%s"' % email).fetchall():
        session.execute('insert into flx2.Members (stateID, login, defaultLogin, email, givenName, surname, creationTime, updateTime) values (2, "%s", "%s", "%s", "%s", "%s", NOW(), NOW())' % (email, email, email, first, last))
        userID = session.execute('select id from flx2.Members where email="%s"' % email).fetchone()[0]
        roleID, groupID = session.execute('select id, groupID from flx2.MemberRoles where name="%s"' % role).fetchone()
        session.execute('insert into flx2.GroupHasMembers (groupID, memberID, roleID) values (%s, %s, %s)' % (groupID, userID, roleID))
        session.execute('insert into flx2.MemberExtData (memberID, authTypeID, token) values(%s, 1, "sha256:7d5fc:89181c9bf3c854410baac5748cdfa2dfe0975dc86af8aa0c80ee1367726c34f2")' % userID)
        session.commit()
        msg = 'Created user %s' % email
        print msg; log.debug(msg)

for email, role, first, last in demoUsers:
    if role == 'student':
        userID = session.execute('select id from flx2.Members where email="%s"' % email).fetchone()[0]
        students.append(userID)

recordsCreated = 0
for u in students:
    recordsCreated = 0
    for c in concepts[:CONCEPTS_ATTEMPTED]:
        exe = session.execute('insert into F_fbs_time_spent (dateID, userID, artifactID, duration) ' \
            'values (%s, %s, %s, %s)' %
            (d, u, c, random.choice([t for t in xrange(1, 100, 10)])))
        recordsCreated += exe.rowcount
    if recordsCreated:
        msg = '%d F_fbs_time_spent records created for user %d' % (recordsCreated, u)
        print msg; log.debug(msg)
if not recordsCreated:
    msg = 'NOTE: No F_fbs_time_spent records created.  Possible reason: Unable to locate concept records.'
    print msg; log.warn(msg)

session.commit()

