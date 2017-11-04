#!/bin/bash
workdir=$(dirname $0)
source ${workdir}/funcs.sh

if [ $# -gt 0 ]; then
	usage
fi

MYSQL="mysql --host=${db_host} --user=${db_user} --password=${db_password} ${db} -N"
errors=0

fm_members=$($MYSQL <<EOF
select count(*) from flexmath.Members;
EOF
)

ads_students=$($MYSQL <<EOF
select count(*) from $db.D_students;
EOF
)

if [ $fm_members -lt $ads_students ]; then
	printf '[ERROR]: incorrect student count in students dimension [flexmath: %s, ads: %s]\n' $fm_members $ads_students
	let errors+=1
fi

dup_students=$($MYSQL <<EOF
select count(*) from $db.D_students group by studentID having count(*)>1;
EOF
)

if [ "$dup_students" != "" ]; then
	printf '[ERROR]: duplicate students in students dimension [dup count: %s]\n' $dup_students
	let errors+=1
fi

fm_groups=$($MYSQL <<EOF
select count(*) from flexmath.Groups;
EOF
)

ads_groups=$($MYSQL <<EOF
select count(*) from $db.D_groups;
EOF
)

if [ $fm_groups != $ads_groups ]; then
	printf '[ERROR]: incorrect group count in groups dimension [flexmath: %s, ads: %s]\n' $fm_groups $ads_groups
	let errors+=1
fi

dup_groups=$($MYSQL <<EOF
select count(*) from $db.D_groups group by groupID having count(*)>1;
EOF
)

if [ "$dup_groups" != "" ]; then
	printf '[ERROR]: duplicate groups in groups dimension [dup count: %s]\n' $dup_groups
	let errors+=1
fi

fm_subjects=$($MYSQL <<EOF
select count(*) from flexmath.Components c, flexmath.Lessons l, flexmath.Units u, flexmath.Subjects s where c.lessonID=l.id and l.unitID=u.id and u.subjectID=s.id;
EOF
)

ads_subjects=$($MYSQL <<EOF
select count(*) from $db.D_subjects;
EOF
)

if [ $fm_subjects != $ads_subjects ]; then
	printf '[ERROR]: incorrect subject count in subjects dimension [flexmath: %s, ads: %s]\n' $fm_subjects $ads_subjects
	let errors+=1
fi

dup_subjects=$($MYSQL <<EOF
select count(*) from $db.D_subjects group by componentID having count(*)>1;
EOF
)

if [ "$dup_subjects" != "" ]; then
	printf '[ERROR]: duplicate subjects in subjects dimension [dup count: %s]\n' $dup_subjects
	let errors+=1
fi

if [ $errors = 0 ]; then
	printf 'No errror found\n'
else
	printf '%s errors found\n' $errors
fi
