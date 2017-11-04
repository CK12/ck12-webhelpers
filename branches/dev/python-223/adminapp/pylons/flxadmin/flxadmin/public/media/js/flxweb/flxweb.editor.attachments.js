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
 * $Id: flxweb.details.flexbook.js 13389 2011-10-28 00:07:01Z nachiket $
 */

(function($) {
    
    function attachmentDeleteClick(){
        var attachment_row = $(this).parents().filter('.js_attachment_row');
        var resource_id = attachment_row.data('resourceId');
        var resource_revision_id = attachment_row.data('resourceRevisionId');
        var artifact_id = attachment_row.data('artifactId');
        var artifact_revision_id = attachment_row.data('artifactRevisionId');

        if (artifact_id.length != 0 || artifact_revision_id.length != 0) {  
            var detach_url = webroot_url + '/ajax/resource/detach/';
            detach_url += artifact_id + '/' + artifact_revision_id + '/'; 
            detach_url += resource_id + '/' + resource_revision_id + '/';
        } else {
            //Remove attachments in artifact data 
            var data = {
            'resource_id' : resource_id,
            'resource_revision_id' : resource_revision_id
            }
            $.flxweb.events.triggerEvent(document, 'flxweb.editor.attachments.remove_attachment', data);
            //If attached file is not associated with any artifact, Just remove it
            var detach_url = webroot_url + '/ajax/resource/delete/';
            detach_url += resource_id + '/';
        } 
        
        $.ajax({
            url: detach_url,
            success: function(){
                attachment_row.hide(500, function(){$(this).remove();});
            }
        });
    }
    
    function domready() {
        //attachment uploader
        $('#fileupload').fileupload({
            dropzone : $(document),
            dataType : 'json'
        }).bind('fileuploadadd',function(e, data){
            var uploadfile = data.files[0];
            var filename = uploadfile.name;
            var id = "attachment_" + new Date().getTime();
            var new_row = $($("#attachment_row_template").html());
            data.attachment_id = id;
            new_row.addClass(id).find('a.js_attachment_uri').html(filename).attr('href','#')
                .bind('click',function(){return false;});
            $("#fileslist").append(new_row);
            
            
        }).bind('fileuploaddone', function(e, data) {
            var id = data.attachment_id;
            var resource = data.result;
            var resource_id = resource.id;
            var resource_revision_id = resource.resourceRevisionID;
            var new_row = $('.'+id);
            var artifact_id = resource.associatedArtifactID || '';
            var artifact_revision_id = resource.associatedArtifactRevisionID || '';
            if (!artifact_id) {
                 //If no artifact, put the attachments data with artifact data for later save.
                 var data = {
                'attachment_url' : resource.uri,
                'attachment_revision' : resource_revision
                }
                $.flxweb.events.triggerEvent(document, 'flxweb.editor.attachments.add_attachment', data);
            } 
            new_row.attr('data-artifact-id',artifact_id)
                .attr('data-artifact-revision-id',artifact_revision_id)
                .attr('data-resource-id',resource_id)
                .attr('data-resource-revision-id', resource_revision_id)
                .attr('class', new_row.attr('class')+' modified'); //Handling dirty state 
            new_row.find('a.js_attachment_uri').html(resource.name).attr('href',resource.uri).unbind('click');
            new_row.find('img.loading').remove();
            new_row.find('.js_attachment_delete').removeClass('hide');
       });
        
        var dialog_attachments = $.flxweb.createDialog($("#attachments_modal_dialog"),{
            'title' : 'Attachments',
            'width' : '400px'
        });
        $("#btn_attachments").click(function() {
            dialog_attachments.open();
            return false;
        });
        
        //delete action
        $('.js_attachment_row .js_attachment_delete').live('click',attachmentDeleteClick);
    }


    $(document).ready(domready);
})(jQuery);
