db.EventTypes.update({'eventType':'FBS_SEARCH'}, {$set:{'search_score_api_path':'flx/search/modality/minimallesson,section,book,tebook,workbook,labkit,quizbook,domain,rwa,lecture,enrichment,worksheet,lab,preread,postread,activity,cthink,prepostread,whileread,flashcard,studyguide,asmtpractice,asmtquiz,quiz,exerciseint,quizdemo,conceptmap,web,image,interactive,lessonplan,handout,presentation,simulationint,simulation/%s','search_score_api_server':'http://www.ck12.org'}})