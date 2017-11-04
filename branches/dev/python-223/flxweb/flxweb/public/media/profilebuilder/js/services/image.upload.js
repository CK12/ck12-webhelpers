define(['jquery', 'jquery.fileupload', 'jquery.iframe-transport'], function ($) {
        'use strict';

        function imageUploadService(){
            var callbackFunction=null;
            var oldImgSrc = '';
            function fileAdd(e, data) {
                var uploadfile = data.files[0],
                    filename = uploadfile.name,
                    fileSize = uploadfile.size;
                if (validateFileType(filename)) {
                    if(validateFileSize(fileSize)) {
                        $('#next_btn').attr({'disabled':'disabled'});
                        $('#resourcePath').hide();
                        oldImgSrc = $('#profileImage').attr('src');
                        $("#ajaxLoadingWait").removeClass('hide_within_PB');
                        $("#profileImage").addClass('hide_within_PB');
                        data.submit();
                    } else {
                        alert("Please select an image of size less than 2MB.");
                    }
                } else {
                    //invalid file extension message goes here
                    alert("Please select a PNG, JPG or GIF image file."); 
                }
            }

            function validateFileType(filename) {
                var filetype_re_str = "jpg|jpeg|png|gif";
                var filetype_re = new RegExp(filetype_re_str, "i");
                return filetype_re.test(filename);
            }
            
            function imageUploadDone(e, data) {
                var result = data.result;
                if (result.responseHeader.status !== 0) {
                    alert(result.response.message);
                    $('#profileImage').attr('src', oldImgSrc);
                    $("#profileImage").removeClass('hide_within_PB');
                    $("#ajaxLoadingWait").addClass('hide_within_PB');
                } else {
                    var image = result.response;
                    if (image.uri) {
                        if (callbackFunction){
                            callbackFunction(image);
                        } else {
                            $('#profileImage').attr('src',image.uri);
                            $('#profileImage').data('default-image','false');
                            $("#profileImage").removeClass('hide_within_PB');
                            $("#ajaxLoadingWait").addClass('hide_within_PB');
                        }
                    } else {
                        $('#profileImage').attr('src', oldImgSrc);
                        $("#profileImage").removeClass('hide_within_PB');
                        $("#ajaxLoadingWait").addClass('hide_within_PB');
                    }
                }
                $('#next_btn').removeAttr('disabled');
                $('#resourcePath').show();
            }
            
            function imageUploadProgress(e, data){
                //image upload progress
            }

            function initImageUploader(callback){
                callbackFunction = callback;
                var image_form = $('#frm_imageupload');
                $('#btn_coveredit_apply').addClass('disabled');
                image_form.fileupload({
                    'dataType' : 'json',
                    'add' : fileAdd,
                    'done' : imageUploadDone,
                    'progress': imageUploadProgress
                });
            }
            
            function validateFileSize(size) {
                return size < 2097152;
            }

            this.initImageUploader = initImageUploader;
        }

        return new imageUploadService();
});
