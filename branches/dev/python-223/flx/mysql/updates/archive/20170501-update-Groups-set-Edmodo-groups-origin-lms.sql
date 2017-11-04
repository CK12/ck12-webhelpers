USE flx2;

BEGIN;

UPDATE `Groups` AS G SET origin = "lms" WHERE G.id IN (SELECT LG.groupID FROM `LMSProviderGroups` AS LG WHERE LG.appID in ("2109d83b62c97630049219d0020f014365fb2107","65f2ee41c12c04866cb5cf184b7edeb5f630e938")) AND G.origin != "lms";

COMMIT;

call update_dbpatch('20170501-update-Groups-set-Edmodo-groups-origin-lms');
