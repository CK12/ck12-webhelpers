-- Invalidate the artifact cache identified by the following artifact IDs after the update.
--
-- 1946528, 1946529, 1946530, 1946531, 1946532, 1946533, 1946537, 1946540, 1946542, 1946545, 1946546, 1946549, 1946553, 1946554, 1946555, 1946556, 1946559, 1946560, 1946561, 1946562, 1946566, 1946568, 1946571, 1946573, 1946574, 1946577, 1946578, 1946579, 1946580, 1946581, 1946582, 1946583, 1946584, 1946585, 1946586, 1946587, 1946588, 1946591, 1946594, 1946595, 1946598, 1946600, 1946603, 1946606, 1946607, 1946608, 1946609, 1946613, 1946614, 1946617, 1946618, 1946620, 1946621, 1946622, 1946627, 1946630, 1946633, 1946634, 1946636, 1946639, 1946640, 1946641, 1946642, 1946644, 1946645, 1946646, 1946647, 1946648, 1946649, 1946651, 1946652, 1946653, 1946654, 1946655, 1946656, 1946657, 1946658, 1946659, 1946660, 1946661, 1946665, 1946667, 1946669, 1946673, 1946678, 1946680, 1946682, 1946689, 1946690, 1946696, 1946697, 1946698, 1946701, 1946705, 1946706, 1946707, 1946708, 1946711, 1946714, 1946716, 1946723, 1946728, 1946729, 1946730, 1946733, 1946735, 1946741, 1946746, 1946747, 1946748, 1946780, 1946787, 1946793, 1946794, 1946803, 1946804, 1946805, 1946806
--
UPDATE BrowseTerms bt, Artifacts a SET a.handle = bt.handle, a.name = bt.name where bt.termTypeID IN (4, 10) AND a.artifactTypeID = 54 AND bt.encodedID = 'ELA.SPL.421.3' AND bt.encodedID = a.encodedID AND bt.handle != a.handle;
UPDATE BrowseTerms bt, Artifacts a SET a.handle = bt.handle, a.name = bt.name where bt.termTypeID IN (4, 10) AND a.artifactTypeID = 54 AND bt.encodedID = 'ELA.SPL.422.2' AND bt.encodedID = a.encodedID AND bt.handle != a.handle;
UPDATE BrowseTerms bt, Artifacts a SET a.handle = bt.handle, a.name = bt.name where bt.termTypeID IN (4, 10) AND a.artifactTypeID = 54 AND bt.encodedID LIKE 'ELA.SPL.%' AND bt.encodedID = a.encodedID AND bt.handle != a.handle;