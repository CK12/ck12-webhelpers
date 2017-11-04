#! /bin/bash
#
# Register time dimension.
#
workdir=$(dirname $0)
source ${workdir}/funcs.sh

register_dim() {
    http 'meta/register/dimension' 'name=time'
    http 'meta/add/hierarchy' 'name=h1&dimension_name=time'
    http 'meta/add/level' 'name=date&hierarchy_name=h1&dimension_name=time'
    http 'meta/add/level' 'name=week&hierarchy_name=h1&dimension_name=time'
    http 'meta/add/level' 'name=month&hierarchy_name=h1&dimension_name=time'
    http 'meta/add/level' 'name=year&hierarchy_name=h1&dimension_name=time'
}

populate_dim() {
    mysql -h ${db_host} -u ${db_user} -p${db_password} ${db} <<EOF
ALTER TABLE D_time ADD KEY (date);
CALL load_time_dim();
EOF
}

register_dim
populate_dim

exit 0
