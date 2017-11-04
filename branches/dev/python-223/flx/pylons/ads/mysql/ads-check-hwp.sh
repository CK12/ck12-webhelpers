#!/bin/bash
workdir=$(dirname $0)
source ${workdir}/funcs.sh

if [ $# -gt 0 ]; then
	usage
fi

MYSQL="mysql --host=${db_host} --user=${db_user} --password=${db_password} ${db} -N"
errors=0

hwp_users=$($MYSQL <<EOF
select count(*) from homeworkpedia.Users;
EOF
)

ads_users=$($MYSQL <<EOF
select count(*) from $db.D_hwp_users;
EOF
)

if [ $hwp_users != $ads_users ]; then
	printf '[ERROR]: incorrect user count in users dimension [hwp: %s, ads: %s]\n' $hwp_users $ads_users
	let errors+=1
fi

dup_users=$($MYSQL <<EOF
select count(*) from $db.D_hwp_users group by userID having count(*)>1;
EOF
)

if [ "$dup_users" != "" ]; then
	printf '[ERROR]: duplicate users in users dimension [dup count: %s]\n' $dup_users
	let errors+=1
fi

hwp_bundles=$($MYSQL <<EOF
select count(*) from homeworkpedia.ExerciseBundle;
EOF
)

ads_bundles=$($MYSQL <<EOF
select count(*) from $db.D_bundles;
EOF
)

if [ $hwp_bundles != $ads_bundles ]; then
	printf '[ERROR]: incorrect bundle count in bundles dimension [hwp: %s, ads: %s]\n' $hwp_bundles $ads_bundles
	let errors+=1
fi

dup_bundles=$($MYSQL <<EOF
select count(*) from $db.D_bundles group by bundleID having count(*)>1;
EOF
)

if [ "$dup_bundles" != "" ]; then
	printf '[ERROR]: duplicate bundles in bundles dimension [dup count: %s]\n' $dup_bundles
	let errors+=1
fi

if [ $errors = 0 ]; then
	printf 'No errror found\n'
else
	printf '%s errors found\n' $errors
fi


