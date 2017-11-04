var TaskResultFormatter = (function(){
  var
  reorder = true, // true to reorder results so ERRORs appears first
  formatTask = function(response){ 
  // Using response.userdata, not .result since that is chopped off after ~250 chars
    return formatStatusRow(response)+formatRows(response.userdata);
  },
  formatStatusRow = function(response){ 
    var id = response.id,
      rows_errs = rows_errs_str(response.userdata);
    return '<div class="tr">\
      <div class="td">-</div>\
      <div class="td">\
        <span class="status">'+response.status+'</span>'+
        ', Task: <a href="'+CK12.admUrl('/task/'+id)+'" id="id">'+id+'</a>'+
        (rows_errs? ', '+rows_errs : '') +
        ', Started: '+(response.started || 'N/A')+
        ', Updated: '+(response.updated || 'N/A')+
        extra_parameters_str(response.userdata) +
      '</div>\
    </div>';
  },
  formatRows = function(s){ 
    if (!s) return '';
    var msgs = [];
    try{
      msgs = $.parseJSON(s).messages; 
    }
    catch(err){
      txt="There was an error parsing the task result.\n\n";
      txt+="Error description: " + err.message + "\n\n";
      alert(txt);
    }
    if (reorder){
      var formatted_err, 
      erroredStrs = [], 
      noErrorStr = _(msgs).reduce(function(mem, msg, rowNum){
        formatted_err = formatRow_errored(msg, rowNum);
        if (formatted_err[1])
          erroredStrs.push(formatted_err[0]);
        return mem + (formatted_err[1]? '' : formatted_err[0]);
      }, '');
      return erroredStrs.join('') + noErrorStr;

    }else{
      return _(msgs).reduce(function(mem, msg, rowNum){
        return mem+formatRow(msg, rowNum);
      }, '');
    }
  },
  formatRow_errored = function(msgs, rowNum){ 
    // returns [formatRow(msgs, rowNum), has ERROR in msgs]
    return [formatRow(msgs, rowNum), _(msgs).any(function(msg){
      return msg.search('ERROR')!=-1;
    })]
  },
  formatRow = function(msgs, rowNum){ 
    // Assume msgs is Array
    return '<div class="tr">\
      <div class="td">'+rowNum+'</div>\
      <div class="td">'+
      _(msgs).reduce(function(mem, msg){
        return mem+highlightError(msg)+'<br>';
      }, '')+'</div></div>';
  },
  highlightError = function(s){
    return (s||'').replace('ERROR', '<span class="red">ERROR</span>');
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
        if (temp_str.source)
            result += ', Source : ' + temp_str.source;
        if (temp_str.newDomainAssociations)
            result += ', New Domain Associations : ' + temp_str.newDomainAssociations;
        if (temp_str.newStandards)
            result += ', New Standards : ' + temp_str.newStandards;
        if (temp_str.skippedDomainAssociations)
            result += ', Skipped Domain Associations : ' + temp_str.skippedDomainAssociations;
        if (temp_str.updatedStandards)
            result += ', Updated Standards : ' + temp_str.updatedStandards;
        if (temp_str.changedArtifacts)
            result += ', Changed Artifacts : ' + (temp_str.changedArtifacts).replace(/\,/g,', ');
    }
	return result;
  };
  
  return {
    formatTask: formatTask,
    formatRows: formatRows,
    rows_errs_str: rows_errs_str
  };
})();
