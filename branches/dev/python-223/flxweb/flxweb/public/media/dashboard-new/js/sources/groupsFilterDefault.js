const groupsFilterDefault = {
    groupadmin: {
        id: 'groupadmin',
        title: 'I lead',
        checked: true,
        mapsTo: 'role'
    },
    groupmember: {
        id: 'groupmember',
        title: 'I\'m a member',
        checked: true,
        mapsTo: 'role'
    },
    class: {
        id: 'class',
        title: 'Classes',
        checked: true,
        mapsTo: 'groupType'
    },
    study: {
        id: 'study',
        title: 'Study Groups',
        checked: true,
        mapsTo: 'groupType'
    }
};

export default groupsFilterDefault;