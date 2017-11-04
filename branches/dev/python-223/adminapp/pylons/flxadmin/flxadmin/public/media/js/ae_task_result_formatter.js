var TaskResultFormatter = (function(){
  var
  reorder = true, // true to reorder results so ERRORs appears first
  formatTask = function(response){ 
  // Using response.userdata, not .result since that is chopped off after ~250 chars
    return formatStatusRow(response) + formatRows(response.userdata);
  },
  formatStatusRow = function(response){
    var id = response.taskID,
      rows_errs = '';//rows_errs_str(response.userdata);
    return '<div class="tr">\
      <div class="td">-</div>\
      <div class="td">\
        <span class="status">'+response.status+'</span>'+
        ', <strong>Task:</strong> <a href="'+CK12.admUrl('/assessment/task/'+id)+'" id="id">'+id+'</a>'+
        ', <strong>Message:</strong> ' + (response.message || 'N/A') +
        ', <strong>Started:</strong> '+(response.started || 'N/A')+
        ', <strong>Updated:</strong> '+(response.updated || 'N/A')+
        extra_parameters_str(response.userdata) +
      '</div>\
    </div>';
  },
  formatRows = function(s){ 
    if (!s) return '';
    var msgs = [];
    try{
      msgs = $.parseJSON(s); 
    }
    catch(err){
      txt="There was an error parsing the task result.\n\n";
      txt+="Error description: " + err.message + "\n\n";
      alert(txt);
    }
    if (reorder){
     var eidErrors=msgs.eidErrors,
         imageErrors=msgs.imageErrors,
         mathErrors=msgs.mathErrors,
         questionErrors=msgs.questionErrors,
         syntaxErrors=msgs.syntaxErrors,
         results=msgs.results,
         msg='',
         result = '',
         rowHeader={'eidErrors':'<h4>Wrong EncodedID Errors</h4>',
                    'imageErrors':'<h4>External Image Upload Errors</h4>',
                    'mathErrors':'<h4>Math Image Errors</h4>',
                    'questionErrors':'<h4>Question Errors</h4>',
                    'syntaxErrors':'<h4>Image Syntax Errors</h4>',
                    'results':'<h4>Successfully uploaded Questions</h4>'
         };
     if (mathErrors.length){
         msg = '<ol>'
            $.each(mathErrors, function (index, error) {
                msg += '<li>' + highlightError(safe_tags(error)) + '</li>'
            });
        msg += '</ol>';
     }else{
         msg += 'No math image errors in the document'
     }
     result = formatRow(msg,rowHeader['mathErrors'])
     if (eidErrors.length){
         msg = '<ol>'
            $.each(eidError, function (index, error) {
                msg += '<li>' + highlightError(safe_tags(error)) + '</li>'
            });
        msg += '</ol>';
     }else{
         msg = 'No encodedID errors in the document'
     }
     result += formatRow(msg,rowHeader['eidErrors'])
     if (imageErrors.length){
         msg = '<ol>'
            $.each(imageErrors, function (index, error) {
                msg += '<li>' + highlightError(safe_tags(error)) + '</li>'
            });
        msg += '</ol>';
     }else{
         msg = 'No image upload errors in the document'
     }
     result += formatRow(msg,rowHeader['imageErrors'])
     if (syntaxErrors.length){
         msg = '<ol>'
            $.each(syntaxErrors, function (index, error) {
                msg += '<li>' + highlightError(safe_tags(error)) + '</li>'
            });
        msg += '</ol>';
     }else{
         msg = 'No image syntax errors in the document'
     }
     result +=  formatRow(msg,rowHeader['syntaxErrors'])
     if (questionErrors.length){
         msg = '<ol>'
            $.each(questionErrors, function (index, error) {
                msg += '<li>' + highlightError(safe_tags(error)) + '</li>'
            });
        msg += '</ol>';
     }else{
         msg = 'No question errors in the document'
     }
     
     result +=  formatRow(msg,rowHeader['questionErrors'])
     
     if (results.length){
         msg = '';
         $.each(results, function (index, result) {
             msg += msg? ', ':'';
             msg += '<a href="/flxadmin/assessment/question/' + result + '" target="_blank">' + result + '</a>'
         });
         msg += '<p>Number of questions uploaded: <strong>' + results.length + '</strong></p>'
     }else{
         msg = 'No Questions were uploaded'
     }
     result +=  formatRow(msg,rowHeader['results'])
     return result;
    }
  },
  formatRow_errored = function(msgs, rowNum){ 
    // returns [formatRow(msgs, rowNum), has ERROR in msgs]
    return [formatRow(msgs, rowNum), _(msgs).any(function(msg){
      return msg.search('ERROR')!=-1;
    })]
  },
  safe_tags = function(str) {
    try{
        return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') ;
    }catch(e){
        str = JSON.stringify(str);
        return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') ;
    }
  },
  formatRow = function(msgs, rowNum){ 
    // Assume msgs is Array
    return '<div class="tr">\
      <div class="td">'+rowNum+'</div>\
      <div class="td">'+
      msgs +'</div></div>';
  },
  highlightError = function(s){
    return (s||'').replace('"error"', '<span class="red">"ERROR"</span>');
  },
  removeRowNums = function(s){
    // Not used now that msgs don't include "Row #:"
    return (s||'').replace(/Row: \d+. |Row \d+: /g, '');
  },
  rows_errs_str = function(s){
    var s = (s||'').match(/"rows": \d+\, "errors": \d+/);
    if (s && s.length) 
      return s[0].replace(/"rows"/, 'Rows').replace(/"errors"/, 'Errors');
    return '';
  };
  
  extra_parameters_str = function(s){
    temp_str = $.parseJSON(s);
    result = '';
    if (temp_str) {
        result += ', <strong>Source: </strong>' + (temp_str.importSrc || 'N/A');
        result += ', <strong>Member ID: </strong>' + (temp_str.importMemberID || 'N/A');
    }else{
        result += ', <strong>Source: </strong>N/A';
        result += ', <strong>Member ID: </strong>N/A';
    }
    return result;
  };
  

  return {
    formatTask: formatTask,
    formatRows: formatRows,
    rows_errs_str: rows_errs_str,
    safe_tags: safe_tags
  };
})();
