-- Update password of ck12editor to be same as the admin
UPDATE `MemberExtData` set `token` = 'sha256:df6289b1b201df269309cde293e94604b0da7a12aa4ca182b037c0b1fca150f1' where `memberID` = 3 and `authTypeID` = 1;

