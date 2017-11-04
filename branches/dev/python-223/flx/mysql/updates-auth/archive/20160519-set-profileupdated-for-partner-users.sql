update Members set isProfileUpdated = 1 where id in (select distinct memberID from MemberExtData where authTypeID = (select id from MemberAuthTypes where name = 'KIDDOM'));
