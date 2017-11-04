db.Standards.find({'standardSet.name': 'CCSS'}).sort({'sequence': 1}).forEach(function (s) {
    if (s.description.length > 0) {
    if (s.description[s.description.length-1] === '.') {
        var desc = s.description.substr(0, s.description.length-1);
        print("UPDATE Standards SET title='" + s.label + "' WHERE description='" + desc.replace("'", "''") + "' AND standardBoardID = (SELECT id FROM StandardBoards WHERE name = 'CCSS');");
    }
    print("UPDATE Standards SET title='" + s.label + "' WHERE description='" + s.description.replace("'", "''") + "' AND standardBoardID = (SELECT id FROM StandardBoards WHERE name = 'CCSS');");
    }
});
db.Standards.find({'standardSet.name': 'NGSS'}).sort({'sequence': 1}).forEach(function (s) {
    if (s.description.length > 0) {
    if (s.description[s.description.length-1] === '.') {
        var desc = s.description.substr(0, s.description.length-1);
        print("UPDATE Standards SET title='" + s.label + "' WHERE description='" + desc.replace("'", "''") + "' AND standardBoardID = (SELECT id FROM StandardBoards WHERE name = 'NGSS');");
    }
    print("UPDATE Standards SET title='" + s.label + "' WHERE description='" + s.description.replace("'", "''") + "' AND standardBoardID = (SELECT id FROM StandardBoards WHERE name = 'NGSS');");
    }
});
