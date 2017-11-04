/**
 * Copyright 2007-2011 CK-12 Foundation
 * 
 * All rights reserved
 * 
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations.
 * 
 * This file originally written by Ravi Gidwani
 * 
 * $Id: flxweb.health.js 14741 2012-01-15 23:30:33Z ravi $
 */
 
define('flxweb.health',
['jquery','jquery-ui','flxweb.settings'],
function($) {
    var $tbody = $('.tbody');
    var rowCount = 0;
    
    function healthCheckSuccess(currentRow,data){
    	rowCount--;
        $(currentRow).html(data);
        $data = $($.trim(data));
        $('#healthCheckTime').html($data.filter('#timeStampHide').html());
        $('#timeStampHide').remove();
        $('#servicestopnav').width($('.tr').width() + 'px');
        $('.actionitem').off();
        init();
        if (rowCount == 0)
        	$("#recheckservices").show();
    }
    
    function healthCheckError(data){
    }
        
    function allServicesStatus(){
    	$("#recheckservices").hide();
        var tr = $('div.tbody form.tr');
        $.each(tr,function(i,val){
        	rowCount++;
            var currentRow = $(this);
            var hostname = $.trim($($(currentRow).find(".td")[1]).text());
            var service = $.trim($($(currentRow).find(".td")[2]).text());
            getServiceStatus(hostname,service,currentRow);
        });
    }
    
    function getServiceStatus(hostname,service,currentRow){
        var imageplaceholder = $($(currentRow).find(".td")[4]);
        var loadingimg = $('#spinner').html();
        imageplaceholder.html(loadingimg);
        $.ajax({
            'url' : $.flxweb.settings.webroot_url + 'healthcheck/service/?hostname=' + hostname+'&servicename=' + service,
            'success' : function(data) {
                          healthCheckSuccess(currentRow,data)
                        },
            'error' : healthCheckError
        });
    }
    
    function init(){
        $('.actionitem').click(function(){
            var $this = $(this);
            currentRow = $this.parent().parent();
            var hostname = $.trim($($(currentRow).find(".td")[1]).text());
            var service = $.trim($($(currentRow).find(".td")[2]).text());
            getServiceStatus(hostname,service,currentRow);
        });
    }
    
    function domReady() {
        $('#recheckservices').click(function(){
            allServicesStatus();
        });
        
        allServicesStatus();
    }
    $(document).ready(domReady);
});
