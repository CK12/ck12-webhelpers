#! /bin/bash
#
# Register FlexBook dimensions and metrics.
#
workdir=$(dirname $0)
source ${workdir}/funcs.sh

register_dims() {
    # artifacts
    http 'meta/register/dimension' 'name=artifacts&tag=1'
    http 'meta/add/hierarchy' 'name=h1&dimension_name=artifacts'
    http 'meta/add/level' 'name=artifact&hierarchy_name=h1&dimension_name=artifacts'
    set_loadscript 'artifacts' 'artifacts.load'
    http 'meta/load/dimension' 'dimension_name=artifacts'

    # revisions
    http 'meta/register/dimension' 'name=revisions'
    http 'meta/add/hierarchy' 'name=h1&dimension_name=revisions&ragged&db_host=${db_host}&db_db=flx2&db_user=${db_user}&db_password=D-coD%2343&lookup_table=ArtifactRevisionRelations&pk_column=hasArtifactRevisionID&parent_pk_column=artifactRevisionID'
    http 'meta/add/level' 'name=revision&hierarchy_name=h1&dimension_name=revisions'
    set_loadscript revisions revisions.load
    http 'meta/load/dimension' 'dimension_name=revisions'

    # users
    http 'meta/register/dimension' 'name=users'
    http 'meta/add/hierarchy' 'name=h1&dimension_name=users'
    http 'meta/add/level' 'name=user&hierarchy_name=h1&dimension_name=users'
    set_loadscript 'users' 'users.load'
    http 'meta/load/dimension' 'dimension_name=users'
    
    # books
    http 'meta/register/dimension' 'name=books&tag=1'  # tag == subject
    http 'meta/add/hierarchy' 'name=h1&dimension_name=books'
    http 'meta/add/level' 'name=concept&hierarchy_name=h1&dimension_name=books'  # concepts or sections
    http 'meta/add/level' 'name=book&hierarchy_name=h1&dimension_name=books'
    http 'meta/add/level' 'name=branch&hierarchy_name=h1&dimension_name=books'
    set_loadscript books books.load
    http 'meta/load/dimension' 'dimension_name=books'
    
    # groups
    http 'meta/register/dimension' 'name=fbs_groups'
    http 'meta/add/hierarchy' 'name=h1&dimension_name=fbs_groups'
    http 'meta/add/level' 'name=group&hierarchy_name=h1&dimension_name=fbs_groups'
    set_loadscript 'fbs_groups' 'fbs_groups.load'
    http 'meta/load/dimension' 'dimension_name=fbs_groups'
}

create_triggers() {
    set_updatescript 'artifacts' 'artifacts.trigger'
    set_updatescript 'revisions' 'revisions.trigger'
    set_updatescript 'users' 'users.trigger'
    set_updatescript 'books' 'books.trigger'
    set_updatescript 'fbs_groups' 'fbs_groups.trigger'
}

register_events() {
    # artifacts downloaded
    http 'meta/register/eventgroup' 'name=fbs_download&dimensions=artifacts,revisions,users&attributes=modality&latency=1'
    http 'meta/register/event' 'name=downloaded&event_group=fbs_download'

    # artifacts visited
    http 'meta/register/eventgroup' 'name=fbs_visit&dimensions=artifacts,revisions,users&attributes=modality&latency=1'
    http 'meta/register/event' 'name=visited&event_group=fbs_visit'

    # modalities visited
    http 'meta/register/eventgroup' 'name=modality&dimensions=artifacts,revisions,users&attributes=modality_type,context_eid,user_role&latency=1'
    http 'meta/register/event' 'name=visited&event_group=modality'
    http 'meta/register/event' 'name=shared&event_group=modality'
    http 'meta/register/event' 'name=clicked&event_group=modality'
    http 'meta/register/event' 'name=time_spent&event_group=modality'

    # Event Group: ilo
    #  Attributes: question_type, question_id, difficulty_level, confidence_level, resources_used
    #      Events: correct, wrong, skipped, hint, time_spent
    #
    http 'meta/register/eventgroup' 'name=ilo&dimensions=artifacts,users&attributes=question_type,question_id,difficulty_level,confidence_level,resources_used,context_eid,session_marker&latency=1'
    http 'meta/register/event' 'name=correct&event_group=ilo'
    http 'meta/register/event' 'name=wrong&event_group=ilo'
    http 'meta/register/event' 'name=skipped&event_group=ilo'
    http 'meta/register/event' 'name=hint&event_group=ilo'
    http 'meta/register/event' 'name=time_spent&event_group=ilo'

    # Promote `ts` to be an event
    http 'meta/register/event' 'name=ts&event_group=ilo'

    # artifacts bookmarked
    http 'meta/register/eventgroup' 'name=fbs_bookmark&dimensions=artifacts,revisions,users&latency=1'
    http 'meta/register/event' 'name=bookmarked&event_group=fbs_bookmark'

    # artifacts shared
    http 'meta/register/eventgroup' 'name=fbs_share&dimensions=artifacts,revisions,users&attributes=social_network&latency=1'
    http 'meta/register/event' 'name=shared&event_group=fbs_share'

    # artifacts customized_started
    http 'meta/register/eventgroup' 'name=fbs_customize_start&dimensions=artifacts,revisions,users&latency=1'
    http 'meta/register/event' 'name=customize_started&event_group=fbs_customize_start'

    # artifacts customized_completed
    http 'meta/register/eventgroup' 'name=fbs_customize_complete&dimensions=artifacts,revisions,users&latency=1'
    http 'meta/register/event' 'name=customize_completed&event_group=fbs_customize_complete'

    # pages navigation
    http 'meta/register/eventgroup' 'name=fbs_navigation&dimensions=users&latency=1&attributes=current_page,next_page'
    http 'meta/register/event' 'name=dummy&event_group=fbs_navigation'
    
    # external request
    http 'meta/register/eventgroup' 'name=flx_external_request&dimensions=users&attributes=action,referrer,ip&latency=1'
    http 'meta/register/event' 'name=dummy&event_group=flx_external_request'
    
   # artifact's Scrible notes
    http 'meta/register/eventgroup' 'name=fbs_note&dimensions=artifacts,revisions,users&latency=1'
    http 'meta/register/event' 'name=count&event_group=fbs_note'

   # artifact's Scrible highlight
    http 'meta/register/eventgroup' 'name=fbs_highlight&dimensions=artifacts,revisions,users&latency=1'
    http 'meta/register/event' 'name=count&event_group=fbs_highlight'
    
    # time spent on artifacts
    http 'meta/register/eventgroup' 'name=fbs_time_spent&dimensions=artifacts,revisions,users&latency=1'
    http 'meta/register/event' 'name=duration&event_group=fbs_time_spent'
}

register_metrics() {
    # revision downloads
    http 'meta/register/metric' "name=downloads&dimensions=revisions:id,artifacts&source_column=downloads&source_table=ArtifactRevisions&source_db_db=flx2&source_db_host=${db_host}&source_db_user=${db_user}&source_db_password=D-coD%2343"

    # revision favorites
    http 'meta/register/metric' "name=favorites&dimensions=revisions:id,artifacts&source_column=favorites&source_table=ArtifactRevisions&source_db_db=flx2&source_db_host=${db_host}&source_db_user=${db_user}&source_db_password=D-coD%2343"
    
    # Register wrapper metrics for events that need to be dissected by books.
    #
    http 'meta/register/metric' "name=m_b_duration&dimensions=artifacts,users,books:artifactID&source_column=duration&source_table=F_fbs_time_spent&source_db_db=${db}&source_db_host=${db_host}&source_db_user=${db_user}&source_db_password=D-coD%2343"
}

deploy_cdos() {
	sudo cp ${workdir}/cdo__concepts_in_book.py /opt/data/ads/cdo
}

create_views() {
	mysql -h ${db_host} -u ${db_user} -p${db_password} ${db} <<EOF
--
-- View to look up concept node by artifact ID
--
DROP VIEW IF EXISTS ArtifactsBrowseTerms;

CREATE SQL SECURITY DEFINER VIEW ArtifactsBrowseTerms	
AS select a.id AS id,b.encodedID AS encodedID
from ((flx2.Artifacts a join flx2.BrowseTerms b) join flx2.ArtifactHasBrowseTerms c)
where ((a.id = c.artifactID) and (b.id = c.browseTermID));
EOF
}

register_dims
create_triggers
register_metrics
register_events
deploy_cdos
create_views

# Data should be consistent, but run integrity check just to be sure
#${workdir}/ads-check-fbs.sh ${args}

exit 0

