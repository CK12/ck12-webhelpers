#! /bin/bash
#
# Register FlexMath dimensions and metrics.
#
workdir=$(dirname $0)
source ${workdir}/funcs.sh

register_dims() {
    # students
    http 'meta/register/dimension' 'name=students'
    http 'meta/add/hierarchy' 'name=h1&dimension_name=students'
    http 'meta/add/level' 'name=student&hierarchy_name=h1&dimension_name=students'
    set_loadscript 'students' 'students.load'
    http 'meta/load/dimension' 'dimension_name=students'

    # groups
    http 'meta/register/dimension' 'name=groups'
    http 'meta/add/hierarchy' 'name=h1&dimension_name=groups'
    http 'meta/add/level' 'name=group&hierarchy_name=h1&dimension_name=groups'
    set_loadscript 'groups' 'groups.load'
    http 'meta/load/dimension' 'dimension_name=groups'

    # subjects
    http 'meta/register/dimension' 'name=subjects'
    http 'meta/add/hierarchy' 'name=h1&dimension_name=subjects'
    http 'meta/add/level' 'name=component&hierarchy_name=h1&dimension_name=subjects'
    http 'meta/add/level' 'name=lesson&hierarchy_name=h1&dimension_name=subjects'
    http 'meta/add/level' 'name=unit&hierarchy_name=h1&dimension_name=subjects'
    http 'meta/add/level' 'name=subject&hierarchy_name=h1&dimension_name=subjects'
    set_loadscript 'subjects' 'subjects.load'
    http 'meta/load/dimension' 'dimension_name=subjects'
}

create_triggers() {
    set_updatescript 'students' 'students.trigger'
    set_updatescript 'groups' 'groups.trigger'
    set_updatescript 'subjects' 'subjects.trigger'
}

register_metrics() {
    # right
    http 'meta/register/metric' "name=right&dimensions=students:memberID,groups:memberID@flexmath.GroupHasMembers,subjects:quizID&source_column=right&source_table=QuizScores&source_db_db=flexmath&source_db_host=${db_host}&source_db_user=${db_user}&source_db_password=D-coD%2343"

    # wrong
    http 'meta/register/metric' "name=wrong&dimensions=students:memberID,groups:memberID@flexmath.GroupHasMembers,subjects:quizID&source_column=wrong&source_table=QuizScores&source_db_db=flexmath&source_db_host=${db_host}&source_db_user=${db_user}&source_db_password=D-coD%2343"

    # points
    http 'meta/register/metric' "name=points&dimensions=students:memberID,groups:memberID@flexmath.GroupHasMembers,subjects:quizID&source_column=points&source_table=QuizScores&source_db_db=flexmath&source_db_host=${db_host}&source_db_user=${db_user}&source_db_password=D-coD%2343"

    # Register a wrapper metric for each event. We need to dissect the event data by groups, but FlexMath app
    # does not have group ID to send along the events, so we create these wrapper metrics to add groups dimension
    # to them. 

    # m_right: wrapper metric for e_right
    http 'meta/register/metric' "name=m_right&dimensions=students,groups:studentID|memberID@flexmath.GroupHasMembers,subjects&source_column=e_right&source_table=F_fm_scores&source_db_db=${db}&source_db_host=${db_host}&source_db_user=${db_user}&source_db_password=D-coD%2343"

    # m_wrong: wrapper metric for e_wrong
    http 'meta/register/metric' "name=m_wrong&dimensions=students,groups:studentID|memberID@flexmath.GroupHasMembers,subjects&source_column=e_wrong&source_table=F_fm_scores&source_db_db=${db}&source_db_host=${db_host}&source_db_user=${db_user}&source_db_password=D-coD%2343"

    # m_skip: wrapper metric for e_skip
    http 'meta/register/metric' "name=m_skip&dimensions=students,groups:studentID|memberID@flexmath.GroupHasMembers,subjects&source_column=e_skip&source_table=F_fm_scores&source_db_db=${db}&source_db_host=${db_host}&source_db_user=${db_user}&source_db_password=D-coD%2343"

    # m_hint: wrapper metric for e_hint
    http 'meta/register/metric' "name=m_hint&dimensions=students,groups:studentID|memberID@flexmath.GroupHasMembers,subjects&source_column=e_hint&source_table=F_fm_scores&source_db_db=${db}&source_db_host=${db_host}&source_db_user=${db_user}&source_db_password=D-coD%2343"

    # m_elapsed_time: wrapper metric for e_elapsed_time
    http 'meta/register/metric' "name=m_elapsed_time&dimensions=students,groups:studentID|memberID@flexmath.GroupHasMembers,subjects&source_column=e_elapsed_time&source_table=F_fm_scores&source_db_db=${db}&source_db_host=${db_host}&source_db_user=${db_user}&source_db_password=D-coD%2343"

    # m_time_spent: wrapper metric for e_time_spent
    http 'meta/register/metric' "name=m_time_spent&dimensions=students,groups:studentID|memberID@flexmath.GroupHasMembers,subjects&source_column=e_time_spent&source_table=F_fm_scores&source_db_db=${db}&source_db_host=${db_host}&source_db_user=${db_user}&source_db_password=D-coD%2343"

    # m_points: wrapper metric for e_points
    http 'meta/register/metric' "name=m_points&dimensions=students,groups:studentID|memberID@flexmath.GroupHasMembers,subjects&source_column=e_points&source_table=F_fm_scores&source_db_db=${db}&source_db_host=${db_host}&source_db_user=${db_user}&source_db_password=D-coD%2343"

    # m_raw_score: wrapper metric for e_raw_score
    http 'meta/register/metric' "name=m_raw_score&dimensions=students,groups:studentID|memberID@flexmath.GroupHasMembers,subjects&source_column=e_raw_score&source_table=F_fm_scores&source_db_db=${db}&source_db_host=${db_host}&source_db_user=${db_user}&source_db_password=D-coD%2343"
}

register_events() {
    # recorded score for individual answer - score ( right, wrong, skip, hint, points, elapsed time)
    http 'meta/register/eventgroup' 'name=fm_scores&dimensions=students,subjects&attributes=lessonID,pageID,pageSequence,difficulty,componentTypeID&latency=1'
    # right answers
    http 'meta/register/event' 'name=e_right&event_group=fm_scores'
    # wrong answers
    http 'meta/register/event' 'name=e_wrong&event_group=fm_scores'
    # skip answers
    http 'meta/register/event' 'name=e_skip&event_group=fm_scores'
    # hint
    http 'meta/register/event' 'name=e_hint&event_group=fm_scores'
    # elapsed time
    http 'meta/register/event' 'name=e_elapsed_time&event_group=fm_scores'
    # time spent
    http 'meta/register/event' 'name=e_time_spent&event_group=fm_scores'
    # points
    http 'meta/register/event' 'name=e_points&event_group=fm_scores'
    # raw score
    http 'meta/register/event' 'name=e_raw_score&event_group=fm_scores'
}

register_dims
create_triggers
register_metrics
register_events

# Data should be consistent, but run integrity check just to be sure
${workdir}/ads-check-fm.sh ${args}

exit 0
