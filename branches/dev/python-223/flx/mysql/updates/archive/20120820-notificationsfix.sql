delete from Notifications where objectID is null and eventTypeID in (select id from EventTypes where name in ('PRINT_GENERATION_SUCCESSFUL', 'PRINT_GENERATION_FAILED', 'PUBLISH_REQUEST')) ;
