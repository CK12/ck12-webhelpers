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
 * This file originally written by Nachiket Karve
 *
 * $id$
 */
(function($) {

    var artifact;

    function toggleCollapsible(){
        var container = $(this).parent();
        $(container).find('.js_arrow').toggleClass('arrow').toggleClass('arrow_right');
        $(container).find('.js_collapsible_content').toggleClass('hide');
    }
    
    function onEditTitle() {
        var title = $.trim( $(this).val() );
        if (title){
            artifact.set({'title': title});
        } else {
            $(this).focus();
        }
    }
    
    function onEditDescription(){
        var desc = $.trim( $(this).val() );
        artifact.set({'summary':desc});
    }
    
    function toggleContentMetadata(){
        var text_old = $(this).text();
        var text_toggle = $(this).data('toggledtext');
        $(this).text(text_toggle)
            .attr('data-toggledtext', text_old)
            .data('toggledtext', text_old);
        $("#contentview").toggleClass('hide');
        $("#metadataview").toggleClass('hide');
        return false;
    }
    
    function addAttachment(e, data){
        var attachments = artifact.get('attachments') || [];
        var resource = data.resource;
        if ( !('associatedArtifactID' in resource && 'associatedArtifactRevisionID' in resource) ){
            attachments.push({
                'attachmentUrl': resource.uri,
                'attachmentID': resource.id,
                'attachmentRevisionID' : resource.resourceRevisionID
            });
        } 
        artifact.set('attachments', attachments);  
    }
    
    function removeAttachment(e, data){
        var attachments = artifact.get('attachments');
        var i;
        if(!attachments) {
            return false;
        }
        var attachment = null;
        for (i=0;i< attachments.length;i++){
            attachment = attachments[i];
            if (attachment.attachmentID == data.resource_id &&
                  attachment.attachmentRevisionID == data.resource_revision_id){
                attachments.splice(i,1); //remove it
                break;
            }
        }
        artifact.set('attachments', attachments);
        //remove the row
        var resource_row = null;
        $('.js_resource_row').each(function(){
           if ($(this).data('resource-id') == data.resource_id) {
               resource_row = $(this);
               return false;
           }
        });
        if ( resource_row && resource_row.size() ){
            resource_row.hide(500, function(){$(this).remove();});
        }
    }
    

    function domReady() {
        artifact = new Artifact(artifact_json);
        var artifact_id = artifact.get('artifactID');
        var revision_id = artifact.get('artifactRevisionID'); 
        //ADS log customize start
        $.flxweb.logADS('fbs_customize_start', 'customize_started', 1, [artifact_id, revision_id, ads_userid], []);
       
        $('#txt_artifacttitle').change(onEditTitle);
        $('#txt_artifact_description').change(onEditDescription);
        
		$('.js_editortabs').tabs({
		    'select' : function (evt, ui){
		        if (ui.tab && ui.tab.hash){
		            window.location.hash = ui.tab.hash;
		        }
		    }
		});
        
        $.extend(true, $.flxweb, {
            'editor' : {
                current_artifact : artifact
            }
        });
        $('.js_collapsible_toggle').click(toggleCollapsible);
        $(".js_save_artifact").click(function() {
            //ADS log customize complete
            $.flxweb.logADS('fbs_customize_complete', 'customize_completed', 1, [artifact_id, revision_id, ads_userid], []);
            $.flxweb.events.triggerEvent(document, 'flxweb.editor.save_start');
        });
        
        $(document).bind('flxweb.editor.attachments.success', addAttachment);
        $(document).bind('flxweb.editor.attachments.remove_attachment', removeAttachment);

    }


    $(document).ready(domReady);
})(jQuery);
