#!/bin/bash

src_branch="${1}"
dest_branch="${2}"


if [ -z "${src_branch}" ] || [ -z "${dest_branch}" ]; then
    echo ">>> Both source and destination branches are required."
    echo ">>> Usage: ${0} <src-branch> <dest-branch>"
    exit 1
fi

if [ "${dest_branch}" = "master" ]; then
    echo "!!! Destination branch cannot be 'master'."
    exit 1
fi

## Get current branch
current_branch="$(git rev-parse --abbrev-ref HEAD)"
echo "<debug> current_branch=${current_branch}"

## Check if remote branch exists
git branch -r | grep -q "origin\/${dest_branch}$"
dest_exists=${?}
if [ "${dest_exists}" -eq 0 ]; then
    echo "!!! Destination remote branch [${dest_branch}] already exists!"
    echo "!!! Will not overwrite. Exiting."
    exit 1
fi

git branch -r | grep -q "origin\/${src_branch}$"
src_exists=${?}
if [ "${src_exists}" -ne 0 ]; then
    echo "!!! Source remote branch [${src_branch}] does not exist."
    echo "!!! Cannot proceed."
    exit 2
fi

## Stash local changes
echo "<debug> Stashing local changes (if any) ..."
stashout="$(git stash)"
[[ ${stashout} == *"No local changes"* ]] && skippop="true"

## Checkout src branch
echo "<debug> Checking out ${src_branch} ..."
git checkout "${src_branch}" || exit 3

git pull || exit 3

## Create the new branch
git checkout -b "${dest_branch}" || exit 3

## Push to remote
git push --set-upstream origin "${dest_branch}" || exit 3

## Restore sanity
echo "<debug> Restoring sanity ..."
git checkout "${current_branch}"
[ -z "${skippop}" ] && git stash pop

echo "Created remote branch: ${dest_branch}"
git branch -r

