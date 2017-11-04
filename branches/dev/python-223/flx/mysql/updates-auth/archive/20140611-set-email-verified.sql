UPDATE Members m, MemberExtData e SET m.emailVerified = 1 WHERE m.emailVerified = 0 AND m.id = e.memberID AND e.authTypeID IN (3, 4, 8, 9, 10);
