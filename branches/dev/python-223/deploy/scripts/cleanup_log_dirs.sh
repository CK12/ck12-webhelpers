#Cleanup log directories on standalone build machines
#don't run this file on environments where the log files are important

BUILD_ROOTS="/opt/2.0/log /var/log/apache2 /var/log/celery"
for dir in ${BUILD_ROOTS}; do
    echo "Cleaning up rotated log files from ${dir} ..."
    sudo rm -rf ${dir}/*.log.*
done

CELERY_FILES=`ls -1d /var/log/celery/*log`
for file in ${CELERY_FILES}; do
    echo "Emptying log file ${file}"
    echo "" > ${file}
done
