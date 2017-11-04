export default (groupsFilter) => {
    let result = 'sort=d_latestGroupActivity', groupTypes = [];
    if(groupsFilter.class.checked){
        groupTypes.push('class');
    }
    if(groupsFilter.study.checked){
        groupTypes.push('study');
    }
    if(groupTypes.length == 0 && !groupsFilter.groupadmin.checked && !groupsFilter.groupmember.checked) {
        groupTypes.push('none');
    }
    if(groupTypes.length > 0){
        result += '&groupTypes=' + groupTypes.join('%2C');
    }
    if(groupsFilter.groupadmin.checked && groupsFilter.groupmember.checked){
        result += '&filters=myRole%2Cmember%3BmyRole%2Ccreator';
    }else if(groupsFilter.groupmember.checked){
        result += '&filters=myRole%2Cmember';
    }else if(groupsFilter.groupadmin.checked){
        result += '&filters=myRole%2Ccreator';
    }
    if(groupsFilter.pageNum){
        result += '&pageNum=' + groupsFilter.pageNum;
    }
    return result;
}
