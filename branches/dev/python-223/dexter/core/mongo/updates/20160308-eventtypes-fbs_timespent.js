db.EventTypes.update({'eventType':'FBS_TIMESPENT'},  {$pull: {'parameters': {'name':'pageType'}}})
