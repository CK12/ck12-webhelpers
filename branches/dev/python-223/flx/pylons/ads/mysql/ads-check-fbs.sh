#!/bin/bash
workdir=$(dirname $0)
source ${workdir}/funcs.sh

if [ $# -gt 0 ]; then
	usage
fi

MYSQL="mysql --host=${db_host} --user=${db_user} --password=${db_password} ${db} -N"
errors=0

flx2_artifacts=$($MYSQL <<EOF
select count(*) from flx2.Artifacts;
EOF
)

ads_artifacts=$($MYSQL <<EOF
select count(*) from $db.D_artifacts d left join flx2.Artifacts a on d.artifactID=a.id where a.id is not null;
EOF
)

if [ $flx2_artifacts != $ads_artifacts ]; then
	printf '[ERROR]: incorrect artifact count in artifacts dimension [flx2: %s, ads: %s]\n' $flx2_artifacts $ads_artifacts
	let errors+=1
fi

dup_artifacts=$($MYSQL <<EOF
select count(*) from $db.D_artifacts group by artifactID having count(*)>1;
EOF
)

if [ "$dup_artifacts" != "" ]; then
	printf '[ERROR]: duplicate artifacts in artifacts dimension [dup count: %s]\n' $dup_artifacts
	let errors+=1
fi

flx2_revisions=$($MYSQL <<EOF
select count(*) from flx2.ArtifactRevisions;
EOF
)

ads_revisions=$($MYSQL <<EOF
select count(*) from $db.D_revisions d left join flx2.ArtifactRevisions r on d.revisionID=r.id where r.id is not null;
EOF
)

if [ $flx2_revisions != $ads_revisions ]; then
	printf '[ERROR]: incorrect revision count in revisions dimension [flx2: %s, ads: %s]\n' $flx2_revisions $ads_revisions
	let errors+=1
fi

dup_revisions=$($MYSQL <<EOF
select count(*) from $db.D_revisions group by revisionID having count(*)>1;
EOF
)

if [ "$dup_revisions" != "" ]; then
	printf '[ERROR]: duplicate revisions in revisions dimension [dup count: %s]\n' $dup_revisions
	let errors+=1
fi

flx2_users=$($MYSQL <<EOF
select count(*) from flx2.Members;
EOF
)

ads_users=$($MYSQL <<EOF
select count(*) from $db.D_users d left join flx2.Members m on d.userID=m.id where m.id is not null;
EOF
)

if [ $flx2_users != $ads_users ]; then
	printf '[ERROR]: incorrect user count in users dimension [flx2: %s, ads: %s]\n' $flx2_users $ads_users
	let errors+=1
fi

dup_users=$($MYSQL <<EOF
select count(*) from $db.D_users group by userID having count(*)>1;
EOF
)

if [ "$dup_users" != "" ]; then
	printf '[ERROR]: duplicate users in users dimension [dup count: %s]\n' $dup_users
	let errors+=1
fi

# ---------------------------------------------------------------------------
# Check D_books dimension table
# ---------------------------------------------------------------------------
flx2_books=$($MYSQL <<EOF
SELECT COUNT(*)
FROM flx2.ArtifactRevisions r, flx2.ArtifactTypes t, $db.B_revisions b, $db.D_artifacts d, flx2.ArtifactRevisions r2, flx2.Artifacts a2, flx2.ArtifactTypes t2, flx2.Artifacts a
LEFT JOIN taxonomy.Branches tb ON tb.shortname=substring_index(substring_index(a.encodedID, '.', 2), '.', -1) 
WHERE r.artifactID=a.id AND a.artifactTypeID=t.id AND t.name IN ('concept', 'section') AND r.id=b.childID AND b.parentID=r2.id AND r2.artifactID=a2.id AND a2.artifactTypeID=t2.id AND t2.name='book' AND a2.id=d.artifactID;
EOF
)

ads_books=$($MYSQL <<EOF
select count(*) from $db.D_books;
EOF
)

if [ $flx2_books != $ads_books ]; then
	printf '[ERROR]: incorrect book count in books dimension [flx2: %s, ads: %s]\n' $flx2_books $ads_books
	let errors+=1
fi

# ---------------------------------------------------------------------------
# Check D_fbs_groups dimension table
# ---------------------------------------------------------------------------
flx2_fbs_groups=$($MYSQL <<EOF
select count(*) from flx2.Groups g;
EOF
)

ads_fbs_groups=$($MYSQL <<EOF
select count(*) from $db.D_fbs_groups;
EOF
)

if [ $flx2_fbs_groups != $ads_fbs_groups ]; then
	printf '[ERROR]: incorrect group count in fbs_groups dimension [flx2: %s, ads: %s]\n' $flx2_fbs_groups $ads_fbs_groups
	let errors+=1
fi

# ---------------------------------------------------------------------------
# Check F_exercise fact table
# ---------------------------------------------------------------------------
n=$($MYSQL <<EOF
select count(*) from $db.F_exercise;
EOF
)

if [ $? -ne 0 ]; then
	printf '[ERROR]: problem with exercise fact table\n'
	let errors+=1
fi

# ---------------------------------------------------------------------------
# Check F_fbs_time_spent fact table
# ---------------------------------------------------------------------------
n=$($MYSQL <<EOF
select count(*) from $db.F_fbs_time_spent;
EOF
)

if [ $? -ne 0 ]; then
	printf '[ERROR]: problem with fbs_time_spent fact table\n'
	let errors+=1
fi

# ---------------------------------------------------------------------------
# Check F_fbs_note fact table
# ---------------------------------------------------------------------------
n=$($MYSQL <<EOF
select count(*) from $db.F_fbs_note;
EOF
)

if [ $? -ne 0 ]; then
	printf '[ERROR]: problem with fbs_note fact table\n'
	let errors+=1
fi

# ---------------------------------------------------------------------------
# Check F_fbs_highlight fact table
# ---------------------------------------------------------------------------
n=$($MYSQL <<EOF
select count(*) from $db.F_fbs_highlight;
EOF
)

if [ $? -ne 0 ]; then
	printf '[ERROR]: problem with fbs_highlight fact table\n'
	let errors+=1
fi

# ---------------------------------------------------------------------------

if [ $errors = 0 ]; then
	printf 'No errror found\n'
else
	printf '%s errors found\n' $errors
fi



