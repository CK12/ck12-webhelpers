DELETE ra
FROM flx2.RelatedArtifacts ra
  JOIN flx2.Artifacts a ON ra.artifactID = a.id
  JOIN flx2.BrowseTerms bt ON ra.domainID = bt.id
WHERE a.handle ilike '%SCIGR%'
AND   creatorID = 3
AND   bt.termTypeID = 4;

DELETE ahbt
FROM flx2.Artifacts AS a,
     flx2.BrowseTerms AS bt,
     flx2.ArtifactHasBrowseTerms AS ahbt
WHERE a.handle ilike '%SCIGR%'
AND   creatorID = 3
AND   ahbt.artifactID = a.id
AND   ahbt.browseTermID = bt.id
AND   bt.termTypeID = 4;
