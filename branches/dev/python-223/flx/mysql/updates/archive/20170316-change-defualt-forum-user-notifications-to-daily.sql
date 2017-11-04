Update Notifications N inner join Groups G on N.groupID = G.id inner join EventTypes E on N.eventTypeID = E.id set N.frequency='daily',N.lastSent=NULL where E.name='GROUP_PH_POST' and N.frequency='instant' and G.groupType='public-forum';

