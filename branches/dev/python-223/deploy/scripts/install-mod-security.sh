#!/bin/bash

cat /etc/lsb-release | grep -q '12\.04'
[ $? -eq 0 ] && isOld=true
echo "isOld=${isOld}"

## Install tools
cd /tmp/
rm -rf modsecurity-2.9.1 lloyd-yajl*

apt-get install -y pkg-config
if [ "${isOld}" = "true" ]; then
    apt-get install -y libtool autoconf apache2-prefork-dev libxml2-dev libapache-mod-security git cmake
else
    apt-get install -y libtool autoconf apache2-prefork-dev libapache2-mod-security2 libxml2-dev git libyajl-dev 
fi

if [ "${isOld}" = "true" ]; then
    wget "http://github.com/lloyd/yajl/tarball/2.1.0" -O yajl.tar.gz
    tar xzf yajl.tar.gz
    cd lloyd-yajl-66cb08c/
    ./configure --prefix=/usr && make && make install
    cp -rp /usr/local/lib/libyajl* /usr/lib/
fi

cd /tmp
wget https://www.modsecurity.org/tarball/2.9.1/modsecurity-2.9.1.tar.gz
tar xzf modsecurity-2.9.1.tar.gz
cd modsecurity-2.9.1/
./autogen.sh && ./configure --with-yajl=/usr && make && make install
mv /usr/lib/apache2/modules/mod_security2.so{,.bak}
cp /usr/local/modsecurity/lib/mod_security2.so /usr/lib/apache2/modules/mod_security2.so
cd /etc
[ ! -h /etc/modsecurity -a ! -d /etc/modsecurity ] && ln -s /opt/2.0/deploy/components/apache2/modsecurity .

#cp modsecurity.conf-recommended /etc/modsecurity/modsecurity.conf
#cp unicode.mapping /etc/modsecurity/unicode.mapping
#cd /tmp/
#git clone https://github.com/SpiderLabs/owasp-modsecurity-crs.git
#cp /tmp/owasp-modsecurity-crs/crs-setup.conf.example /etc/modsecurity/crs-setup.conf
#cp -rp /tmp/owasp-modsecurity-crs/rules /etc/modsecurity/rules
#sed -e 's|SecRuleEngine DetectionOnly|SecRuleEngine On|' -i /etc/modsecurity/modsecurity.conf

## Edit /etc/apache2/mods-enabled/security2.conf (/etc/apache2/mods-enabled/mod-security.conf)
## Add line: Include /etc/modsecurity/rules/*.conf
## Try restarting apache. If you get an error, may need to remove this file: 
## vi /etc/modsecurity/rules/RESPONSE-950-DATA-LEAKAGES.conf ## Add a space before back-slash on line 36

