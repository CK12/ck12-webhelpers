use auth;
Delete from `MemberExtData` where `memberID`=@memberID;
Delete from `MemberHasRoles` where `memberID`=@memberID;
Delete from `Members` where `id`=@memberID;

use flx2;
Delete from `GroupHasMembers` where `memberID`=@memberID;
Delete from `Notifications` where `subscriberID`=@memberID;
Delete from `Members` where `id`=@memberID;
