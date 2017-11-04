--
-- stored procedure to migrate old fbs_visit events to F_modality.
--

DELIMITER //
drop procedure if exists fbs_visit_to_modality;
create procedure fbs_visit_to_modality()
begin    
    declare t_s timestamp;
     declare date_id int(11);
     declare artifact_id int(11);
     declare revision_id int(11);
     declare user_id int(11);
      declare eid_total int(11) default 0;
     declare visited_val float;
     declare c_eid varchar(100);
     declare m_type varchar(100);
     declare done int default 0;
     declare min_ts_modality timestamp;
    declare fbs_visit_cur CURSOR for select ts,dateID,artifactID,revisionID,userID,visited from F_fbs_visit  where ts < min_ts_modality order by ts desc ;
     DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;  
     select min(ts) into min_ts_modality from F_modality;
    open fbs_visit_cur;
    repeat fetch fbs_visit_cur into t_s,date_id,artifact_id,revision_id,user_id,visited_val;
   if done = 0
   THEN
       set c_eid='';
       select count(*) into eid_total from F_modality where artifactID=artifact_id;
       IF eid_total > 0
       THEN
           select context_eid,modality_type into c_eid,m_type from F_modality where artifactID=artifact_id order by context_eid desc limit 1;
       END IF;
       insert into F_modality(ts,dateID,artifactID,revisionID,userID,modality_type,context_eid,user_role,visited,shared,clicked,time_spent)  values ( t_s,date_id,artifact_id,revision_id,user_id,m_type, c_eid, NULL, visited_val, NULL, NULL, NULL);
     end if ;
     until done
     end repeat; 
     close fbs_visit_cur; 
end//
DELIMITER ;

call fbs_visit_to_modality();
