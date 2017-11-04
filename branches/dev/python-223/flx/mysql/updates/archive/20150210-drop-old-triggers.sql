use flx2;
drop trigger if exists T_revisions;
drop trigger if exists T_artifacts;
drop trigger if exists T_fbs_groups;
drop trigger if exists T_fbs_groups_delete;
drop trigger if exists T_users;

use taxonomy;
drop trigger if exists T_DomainNeighbors_create;
drop trigger if exists T_DomainNeighbors_update;
drop trigger if exists T_DomainNeighbors_delete;
drop trigger if exists T_BrowseTerms_create;
drop trigger if exists T_BrowseTerms_update;
drop trigger if exists T_BrowseTerms_delete;
