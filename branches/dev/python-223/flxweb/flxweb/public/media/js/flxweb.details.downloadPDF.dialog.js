define(['jquery', 'underscore', 'common/utils/utils'], function($, _, util){
    var requeestDownloadPDF = null;
    var downloadPDFconfig = null;
    function openDownloadPDFDialog(href, pdfDialogConfig, cb){
        resetForm();
        downloadPDFconfig = pdfDialogConfig;
        $('.download-btn').attr('href', href);
        requeestDownloadPDF = cb;
        $('#downloadPDFModal').foundation('reveal', 'open');
    }
    function closeDownloadPDFDialog(){
        $('#downloadPDFModal').foundation('reveal', 'close');
    }
    function resetForm(){
        $('.grade-checkbox .download-form-field').attr('checked',false);
        $('.subject-filed').val('');
        $('.school-name-radio').attr('checked', true);
        $('.school-name-field').val('');
        $('.college-name-field').val('');
        $('.number-of-students input').val('');
        if(!$('.download-btn').hasClass('disabled')){
            $('.download-btn').addClass('disabled grey');
        }
    }
    function schoolAutoComplete(thisElement) {
        var value, url;
        value = ($(thisElement).val() || '').trim();
        url = util.getApiUrl('auth/search/school/' + value);
        if (value) {
            util.ajax({
                url: url,
                success: function (result) {
                    if (result && result.response && result.response.schools) {
                        var schools = result.response.schools;
                        value = ($(thisElement).val() || '').trim();
                        if (schools && schools.length > 0) {
                            renderSchools(value, schools);
                        }
                    }
                },
                error: function () {
                    console.log('error');
                }
            });
        }
    }
    var debouncedSchoolAutoComplete = _.debounce(schoolAutoComplete, 500, true);
    function renderSchools(value, schools) {
        var index, htmlString, re, $schoolInfo, $schoolAutosuggest, str = '';
        $schoolInfo = $('#schoolInfo');
        $schoolAutosuggest = $('#schoolAutosuggest');
        $schoolAutosuggest.removeClass('hidden');
        $('#schoolAutosuggest li').remove();
        $schoolAutosuggest = $('#schoolAutosuggest');
        value = value.toUpperCase();
        for (index = 0; index < schools.length; index++) {
            re = new RegExp(value);
            htmlString = schools[index].name.replace(re, '<span style="font-weight:bold">' + value + '</span>');
            str += '<li data-id="' + schools[index].id + '" data-name="' + schools[index].name + '">' + htmlString + '<span class="school-state"> (' + schools[index].city + ',' + schools[index].state + ')</span></li>';
        }
        $schoolAutosuggest.append(str);
        $('#schoolAutosuggest li').off('click.select').on('click.select', function () {
            $('#saveSchool').find('span').removeClass('inactive-handle').addClass('change-handle');
            $('#schoolAutosuggest').addClass('hidden');
            $schoolInfo.val($(this).attr('data-name'));
            $schoolInfo.attr('data-id', $(this).attr('data-id'));
            $schoolInfo.attr('data-name', $(this).attr('data-name'));
            $schoolInfo.focus();
        });
    }
    $('#schoolInfo').off('keyup.school').on('keyup.school', function (evt) {
        var value, thisElement = this;
        if ((evt.which || evt.keyCode) === 13) {
            $('#schoolAutosuggest').addClass('hidden');
            $('#schoolAutosuggest li').remove();
        } else {
            $('#saveSchool').find('span').removeClass('inactive-handle').addClass('change-handle');
            value = ($(thisElement).val() || '').trim();
            if (value !== '') {
                if (value !== '') {
                    debouncedSchoolAutoComplete(thisElement);
                }
            } else {
                $('#schoolAutosuggest').addClass('hidden');
                $('#schoolAutosuggest li').remove();
            }
        }
    });
    function validateInput(){
        var allFields = [false, false, false, false];
        if($('.grade-checkbox .download-form-field:checked').length > 0){
            allFields[0] = true;
        }else{
            allFields[0] = false;
        }
        if($('.subject-filed').val().trim().length > 0){
            allFields[1] = true;
        }else{
            allFields[1] = false;
        }

        if($('.school-name-radio:checked').length > 0){
            if($('.school-name-field').val().trim().length > 0){
                allFields[2] = true;
            }else{
                allFields[2] = false;
            }
        }else if($('.college-name-radio:checked').length > 0){
            if($('.college-name-field').val().trim().length > 0){
                allFields[2] = true;
            }else{
                allFields[2] = false;
            }
        }else{
            allFields[2] = true;
        }

        if(/^[0-9]+$/g.test($('.number-of-students input').val())){
            allFields[3] = true;
        }else{
            allFields[3] = false;
        }
        return !allFields.some(function(el){
            return el === false;
        });
    }
    function getData(){
        var data = [];
        var grades = [];
        $('.grade-checkbox .download-form-field:checked').each(function(){
            grades.push($(this).val());
        });
        data.push(grades);
        data.push($('.subject-filed').val().trim());
        if($('.school-name-radio:checked').length > 0){
            data.push($('.school-name-field').val().trim());
        }else if($('.college-name-radio:checked').length > 0){
            data.push('college-' + $('.college-name-field').val().trim());
        }else{
            data.push('homeschool');
        }
        data.push(parseInt($('.number-of-students input').val()));
        return data;

    }
    $('.download-form-field').off('click').on('click', function(){
        if(validateInput()){
            $('.download-btn').removeClass('disabled grey');
        }else{
            if(!$('.download-btn').hasClass('disabled')){
                $('.download-btn').addClass('disabled grey');
            }
        }
    }).on('keyup', function(){
        if(validateInput()){
            $('.download-btn').removeClass('disabled grey');
        }else{
            if(!$('.download-btn').hasClass('disabled')){
                $('.download-btn').addClass('disabled grey');
            }
        }
    });
    function sendDataToServer(){
        var data = getData();
        var sendData = {
            grades: data[0].join(','),
            subjects: data[1],
            school: data[2],
            noOfUsers: data[3],
            artifactID : window.artifactID
        };
        url = util.getApiUrl('flx/save/pdf/download/info');
        util.ajax({
            url: url,
            data: sendData,
            success: function (result) {
            },
            error: function () {
                console.log('error');
            }
        });
    }
    $('.download-btn').off('click').on('click', function(e){
        if($(e.currentTarget).hasClass('disabled')){
            return;
        }
        sendDataToServer();
        requeestDownloadPDF();
        downloadPDFconfig.enable = false;
        closeDownloadPDFDialog();
    });
    return{
        open: openDownloadPDFDialog
    }
});
