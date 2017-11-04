#! /bin/bash
#
# Register HWP dimensions and metrics. Also load demo report data.
#
workdir=$(dirname $0)
source ${workdir}/funcs.sh

register_dims() {
    # hwp_users
    http 'meta/register/dimension' 'name=hwp_users'
    http 'meta/add/hierarchy' 'name=h1&dimension_name=hwp_users'
    http 'meta/add/level' 'name=user&hierarchy_name=h1&dimension_name=hwp_users'
    set_loadscript 'hwp_users' 'hwp_users.load'
    http 'meta/load/dimension' 'dimension_name=hwp_users'

    # bundles
    http 'meta/register/dimension' 'name=bundles'
    http 'meta/add/hierarchy' 'name=h1&dimension_name=bundles'
    http 'meta/add/level' 'name=bundle&hierarchy_name=h1&dimension_name=bundles'
    set_loadscript 'bundles' 'bundles.load'
    http 'meta/load/dimension' 'dimension_name=bundles'
}

register_events() {
    # attempt
    http 'meta/register/eventgroup' 'name=hwp_attempt&dimensions=artifacts,users&attributes=question_type,question_id,correctness,difficulty_level&latency=1'
    http 'meta/register/event' 'name=attempted&event_group=hwp_attempt'

    # Promote `ts` to be an event
    http 'meta/register/event' 'name=ts&event_group=hwp_attempt'
    
    # Event Group: exercise
    #  Attributes: question_type, question_id, difficulty_level, confidence_level, resources_used
    #      Events: correct, wrong, skipped, hint, time_spent
    #
    http 'meta/register/eventgroup' 'name=exercise&dimensions=artifacts,users&attributes=question_type,question_id,difficulty_level,confidence_level,resources_used&latency=1'
    http 'meta/register/event' 'name=correct&event_group=exercise'
    http 'meta/register/event' 'name=wrong&event_group=exercise'
    http 'meta/register/event' 'name=skipped&event_group=exercise'
    http 'meta/register/event' 'name=hint&event_group=exercise'
    http 'meta/register/event' 'name=time_spent&event_group=exercise'

    # Promote `ts` to be an event
    http 'meta/register/event' 'name=ts&event_group=exercise'
}

create_triggers() {
    set_updatescript 'hwp_users' 'hwp_users.trigger'
    set_updatescript 'bundles' 'bundles.trigger'
}

register_metrics() {
    # Test duration
    http 'meta/register/metric' "name=duration&dimensions=hwp_users,bundles&source_column=duration&source_table=TestResults&source_db_db=homeworkpedia&source_db_host=${db_host}&source_db_user=${db_user}&source_db_password=D-coD%2343"

    # Test correct count
    http 'meta/register/metric' "name=correct_count&dimensions=hwp_users,bundles&source_column=correctCount&source_table=TestResults&source_db_db=homeworkpedia&source_db_host=${db_host}&source_db_user=${db_user}&source_db_password=D-coD%2343"

    # Test total attempt
    http 'meta/register/metric' "name=total_attempt&dimensions=hwp_users,bundles&source_column=totalAttempt&source_table=TestResults&source_db_db=homeworkpedia&source_db_host=${db_host}&source_db_user=${db_user}&source_db_password=D-coD%2343"
    
    # App does not have group ID to send along the events, register wrapper metrics for
    # events that need to be dissected by groups.
    #
    http 'meta/register/metric' "name=m_correct&dimensions=artifacts,users,fbs_groups:userID|memberID@flx2.GroupHasMembers&source_column=correct&source_table=F_exercise&source_db_db=${db}&source_db_host=${db_host}&source_db_user=${db_user}&source_db_password=D-coD%2343"
    http 'meta/register/metric' "name=m_wrong&dimensions=artifacts,users,fbs_groups:userID|memberID@flx2.GroupHasMembers&source_column=wrong&source_table=F_exercise&source_db_db=${db}&source_db_host=${db_host}&source_db_user=${db_user}&source_db_password=D-coD%2343"
    http 'meta/register/metric' "name=m_skipped&dimensions=artifacts,users,fbs_groups:userID|memberID@flx2.GroupHasMembers&source_column=skipped&source_table=F_exercise&source_db_db=${db}&source_db_host=${db_host}&source_db_user=${db_user}&source_db_password=D-coD%2343"
    http 'meta/register/metric' "name=m_hint&dimensions=artifacts,users,fbs_groups:userID|memberID@flx2.GroupHasMembers&source_column=hint&source_table=F_exercise&source_db_db=${db}&source_db_host=${db_host}&source_db_user=${db_user}&source_db_password=D-coD%2343"
    http 'meta/register/metric' "name=m_time_spent&dimensions=artifacts,users,fbs_groups:userID|memberID@flx2.GroupHasMembers&source_column=time_spent&source_table=F_exercise&source_db_db=${db}&source_db_host=${db_host}&source_db_user=${db_user}&source_db_password=D-coD%2343"

    # Register wrapper metrics for events that need to be dissected by books.
    #
    http 'meta/register/metric' "name=m_b_correct&dimensions=artifacts,users,books:artifactID&source_column=correct&source_table=F_exercise&source_db_db=${db}&source_db_host=${db_host}&source_db_user=${db_user}&source_db_password=D-coD%2343"
    http 'meta/register/metric' "name=m_b_wrong&dimensions=artifacts,users,books:artifactID&source_column=wrong&source_table=F_exercise&source_db_db=${db}&source_db_host=${db_host}&source_db_user=${db_user}&source_db_password=D-coD%2343"
    http 'meta/register/metric' "name=m_b_skipped&dimensions=artifacts,users,books:artifactID&source_column=skipped&source_table=F_exercise&source_db_db=${db}&source_db_host=${db_host}&source_db_user=${db_user}&source_db_password=D-coD%2343"
    http 'meta/register/metric' "name=m_b_hint&dimensions=artifacts,users,books:artifactID&source_column=hint&source_table=F_exercise&source_db_db=${db}&source_db_host=${db_host}&source_db_user=${db_user}&source_db_password=D-coD%2343"
    http 'meta/register/metric' "name=m_b_time_spent&dimensions=artifacts,users,books:artifactID&source_column=time_spent&source_table=F_exercise&source_db_db=${db}&source_db_host=${db_host}&source_db_user=${db_user}&source_db_password=D-coD%2343"
}

register_dims
create_triggers
register_metrics
register_events

# Load demo data
PYTHONPATH=${PYTHONPATH} python demodata.py ${db_host}

# Data should be consistent, but run integrity check just to be sure
${workdir}/ads-check-hwp.sh ${args}

exit 0
