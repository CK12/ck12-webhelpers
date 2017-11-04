#!/bin/bash

myself="${0}"
mydir=$(dirname ${0})
pushd "${mydir}" >/dev/null
mydir="$(pwd)"
popd >/dev/null
echo "mydir=${mydir}"
beaker_version="$(pip list | grep '^Beaker ' | sed -e 's|^Beaker (\([0-9\.a-z]*\)).*$|\1|')"
if [ -n "${beaker_version}" ]; then
    echo "Found beaker ${beaker_version}"
    patch_file="${mydir}/beaker-${beaker_version}-session-delete.patch"
    echo "Checking patch: [${patch_file}]"
    if [ -f "${patch_file}" ]; then
        echo "Patch exists."
        beaker_dir="$(pip show Beaker | grep '^Location:' | sed -e 's|Location: \(.*\)$|\1|')"
        if [ -d "${beaker_dir}" ]; then
            pushd "${beaker_dir}/beaker"
            sudo patch -p0 -N -i "${patch_file}"
            if [ $? -eq 0 ]; then
                echo "Patched ${beaker_dir}/beaker"
            else
                echo "Failied to patch ${beaker_dir}/beaker"
                exit 1
            fi
        else
            echo "Found beaker version ${beaker_version} but cannot locate beaker installation"
            exit 1
        fi
    else
        echo "No patch available for installed beaker ${beaker_version}. Please use a supported beaker version."
    fi
else
    echo "Could not find installed beaker. Please use 'sudo pip install beaker' to install it first."
    exit 1
fi
