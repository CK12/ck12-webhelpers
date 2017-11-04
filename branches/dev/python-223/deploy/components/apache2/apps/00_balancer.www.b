## 
## This configuration is only for HTTPS request handling
## This file should only be used in a cluster environment
## 

ProxyRequests Off  
ProxyPreserveHost on
SSLProxyEngine On

<Proxy balancer://flx_auth>
    BalancerMember https://flxcore4.ck12.org:443 retry=1 acquire=3000 timeout=600 Keepalive=On
    BalancerMember https://flxcore5.ck12.org:443 retry=1 acquire=3000 timeout=600 Keepalive=On
    BalancerMember https://flxcore6.ck12.org:443 retry=1 acquire=3000 timeout=600 Keepalive=On
</Proxy>

<Proxy balancer://asmt>
    BalancerMember https://asmtcore3.ck12.org:443
    BalancerMember https://asmtcore4.ck12.org:443
</Proxy>

<Proxy balancer://ads>
    BalancerMember https://adscore1.ck12.org:443
    BalancerMember https://adscore2.ck12.org:443
</Proxy>

ProxyPass        /api/auth/ balancer://flx_auth/auth/
ProxyPassReverse /api/auth/ balancer://flx_auth/auth/

ProxyPass        /auth/ balancer://flx_auth/auth/
ProxyPassReverse /auth/ balancer://flx_auth/auth/

ProxyPass        /api/flx/ balancer://flx_auth/flx/
ProxyPassReverse /api/flx/ balancer://flx_auth/flx/

ProxyPass        /flx/ balancer://flx_auth/flx/
ProxyPassReverse /flx/ balancer://flx_auth/flx/

ProxyPass        /api/taxonomy/ balancer://flx_auth/taxonomy/
ProxyPassReverse /api/taxonomy/ balancer://flx_auth/taxonomy/

ProxyPass        /taxonomy/ balancer://flx_auth/taxonomy/
ProxyPassReverse /taxonomy/ balancer://flx_auth/taxonomy/

ProxyPass        /api/assessment/api/ balancer://asmt/assessment/api/
ProxyPassReverse /api/assessment/api/ balancer://asmt/assessment/api/

ProxyPass        /assessment/api/ balancer://asmt/assessment/api/
ProxyPassReverse /assessment/api/ balancer://asmt/assessment/api/

ProxyPass        /api/peerhelp/api/ balancer://asmt/peerhelp/api/
ProxyPassReverse /api/peerhelp/api/ balancer://asmt/peerhelp/api/

ProxyPass        /peerhelp/api/ balancer://asmt/peerhelp/api/
ProxyPassReverse /peerhelp/api/ balancer://asmt/peerhelp/api/

ProxyPass        /api/dexter/ balancer://ads/dexter/
ProxyPassReverse /api/dexter/ balancer://ads/dexter/

ProxyPass        /dexter/ balancer://ads/dexter/
ProxyPassReverse /dexter/ balancer://ads/dexter/

ProxyPass        /2.0/ http://api/2.0/
ProxyPassReverse /2.0/ http://api/2.0/

ProxyPass        /api2/ http://apiproxy/api2/
ProxyPassReverse /api2/ http://apiproxy/api2/
