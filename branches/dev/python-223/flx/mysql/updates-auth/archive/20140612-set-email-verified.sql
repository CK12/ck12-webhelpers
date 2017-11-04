UPDATE Members m, MemberExtData e SET m.emailVerified = 1 WHERE m.emailVerified = 0 AND m.id = e.memberID AND ( e.authTypeID != 5 OR e.verified = 1 );
