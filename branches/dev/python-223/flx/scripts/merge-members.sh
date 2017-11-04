#! /bin/bash -x

. /opt/env/auth/bin/activate
python -u /opt/2.0/flx/scripts/merge-member.py -d 2234132 -k 2234178
python -u /opt/2.0/flx/scripts/merge-member.py -d 1233332 -k 851129
python -u /opt/2.0/flx/scripts/merge-member.py -d 1265807 -k 1265900
python -u /opt/2.0/flx/scripts/merge-member.py -d 2152197 -k 2159935
python -u /opt/2.0/flx/scripts/merge-member.py -d 1264523 -k 1263653
python -u /opt/2.0/flx/scripts/merge-member.py -d 1205604 -k 1229561
python -u /opt/2.0/flx/scripts/merge-member.py -d 2170270 -k 2170335
python -u /opt/2.0/flx/scripts/merge-member.py -d 439212 -k 2006654
python -u /opt/2.0/flx/scripts/merge-member.py -d 1334258 -k 1334354
python -u /opt/2.0/flx/scripts/merge-member.py -d 1854728 -k 1855860
python -u /opt/2.0/flx/scripts/merge-member.py -d 1418297 -k 1418298
python -u /opt/2.0/flx/scripts/merge-member.py -d 1646752 -k 1706839
python -u /opt/2.0/flx/scripts/merge-member.py -d 1399787 -k 1399744
python -u /opt/2.0/flx/scripts/merge-member.py -d 1598384 -k 1612646
python -u /opt/2.0/flx/scripts/merge-member.py -d 1101380 -k 925221
python -u /opt/2.0/flx/scripts/merge-member.py -d 902213 -k 864371
python -u /opt/2.0/flx/scripts/merge-member.py -d 1672111 -k 1795427
python -u /opt/2.0/flx/scripts/merge-member.py -d 1646264 -k 781213
python -u /opt/2.0/flx/scripts/merge-member.py -d 1650075 -k 1748266
python -u /opt/2.0/flx/scripts/merge-member.py -d 1091642 -k 972196
python -u /opt/2.0/flx/scripts/merge-member.py -d 1958413 -k 1958594
python -u /opt/2.0/flx/scripts/merge-member.py -d 1162645 -k 1041567
python -u /opt/2.0/flx/scripts/merge-member.py -d 2164523 -k 2269567
python -u /opt/2.0/flx/scripts/merge-member.py -d 1436031 -k 1437932
python -u /opt/2.0/flx/scripts/merge-member.py -d 2198712 -k 2261696
python -u /opt/2.0/flx/scripts/merge-member.py -d 1749089 -k 2079720
python -u /opt/2.0/flx/scripts/merge-member.py -d 1409211 -k 1409294
python -u /opt/2.0/flx/scripts/merge-member.py -d 1432659 -k 2193279
python -u /opt/2.0/flx/scripts/merge-member.py -d 1487779 -k 1978953
python -u /opt/2.0/flx/scripts/merge-member.py -d 1823708 -k 1823715
python -u /opt/2.0/flx/scripts/merge-member.py -d 1859982 -k 1930888
python -u /opt/2.0/flx/scripts/merge-member.py -d 1064108 -k 1238971
python -u /opt/2.0/flx/scripts/merge-member.py -d 1337078 -k 1216931
python -u /opt/2.0/flx/scripts/merge-member.py -d 1159651 -k 1155939
python -u /opt/2.0/flx/scripts/merge-member.py -d 1717140 -k 1698683

. /opt/env/peerhelp/bin/activate
python -u /opt/peerhelp/core/scripts/merge_user_data.py --csv /opt/2.0/flx/scripts/merge.csv --db_url mongodb://localhost:27017/peer_help --db_replica_set rs0 --security_db_url mongodb://localhost:27017/cache.Cry --security_db_replica_set rs0

. /opt/env/assessment/bin/activate
python -u /opt/assessment/engine/scripts/userid_migration.py --csv /opt/2.0/flx/scripts/merge.csv --db_url mongodb://localhost:27017/assessment --db_replica_set rs0 --security_db_url mongodb://localhost:27017/cache.Cry --security_db_replica_set rs0
