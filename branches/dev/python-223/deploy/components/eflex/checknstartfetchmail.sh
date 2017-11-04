#!/bin/bash

f=`ps -e | grep fetchmail`
if [[ "$f" == "" ]]
then
    fetchmail -d 10;
    exit 0;
fi
exitc=false
case "$f" in
*grep*)
    exitc="true"
    ;;
*)
    exitc="false"
    ;;
esac

if [[ "$exitc" == *tru* ]]
then
    fetchmail -d 10;
    exit 0;
fi

IFS=' ' read -ra ADDR <<< "$f"
for i in "${ADDR[@]}"; do
    id=$i
    break
done
echo "Process ID: $id"
