delete from Notifications where frequency in ('once') and type in ('email') and lastSent is null and created <= date_sub(now(), interval 1 day) and eventTypeID in (22, 23);
