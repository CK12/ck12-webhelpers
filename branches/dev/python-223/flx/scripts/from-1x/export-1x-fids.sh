csv=/tmp/fb.csv
rm -f ${csv}
mysql --user=dbadmin --password=D-coD#43 flexr <<DOD
select f.flexbook_id as id, f.flexbook_published as published, f.flexbook_updated as updated, u.email, f.flexbook_title as title, u.last_login from flexbook as f, auth_user as u where f.flexbook_userid = u.id and u.email != '' order by u.email, f.flexbook_id into outfile '${csv}' fields terminated by ',';
DOD

execPath=/opt/2.0/flx/scripts/from-1x
python -u ${execPath}/export-1x-fids.py --csv=${csv} --dest=. --exec=${execPath}
