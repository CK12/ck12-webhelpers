MAPPING = {
1732582 : "irwin-2d",
1732556 : "prom-night",
1732568 : "doppler-ducks",
1732591 : "bobsled",
1732587 : "newtons-cannon",
1732566 : "violin",
1732581 : "at-the-crossroads",
1732575 : "portrait-gallery",
1732580 : "driverless-car",
1732585 : "butterfly-stroke",
1757977 : "model-rocket",
1732588 : "irwin-and-ruthie",
1732586 : "cliff-diver",
1732577 : "tire-pressure",
1732590 : "pirate-ship",
1742555 : "bow-and-arrow",
1742556 : "everglades-airboat",
1742551 : "hot-air-balloon",
1990343 : "elevator",
1990344 : "airplane",
1795182 : "sprinter",
1732593 : "malt-shop",
1742543 : "horse-and-cart",
1732574 : "water-fountain",
1732573 : "archery",
1916718 : "phases-of-the-moon",
1732589 : "tetherball",
1742546 : "loop-the-loop",
1732579 : "clarkes-dream",
1742554 : "astronaut-training-chamber",
1916740 : "walk-the-tightrope",
1732584 : "newtons-apple",
1732578 : "space-station",
1732565 : "journey-to-mars",
1742548 : "ballistics-tests",
1732594 : "crash-test-dummy",
1757978 : "bumper-cars",
1742544 : "collisions",
1732572 : "wind-turbine",
1742552 : "ramp-and-piano",
1742592 : "see-saw",
1916734 : "drawbridge",
1916739 : "orbital-motion",
1916738 : "unicycle",
1916736 : "yo-yo",
1916737 : "bowling-alley",
1757975 : "block-and-tackle",
1732570 : "trampoline",
1732595 : "high-energy-particles",
1742545 : "roller-coaster",
1757976 : "ski-jump",
1795184 : "the-marina",
1732558 : "heat-engine",
1732569 : "hot-oven",
1732571 : "scuba-training",
1742591 : "runaway-balloon",
1732564 : "pan-flute",
1732563 : "stadium-wave",
1732583 : "stow-lake",
1732562 : "light-wave",
1916733 : "rose-colored-glasses",
1742547 : "diamond-cut",
1916735 : "least-time",
1732557 : "cassegrain-telescope",
1732596 : "contact-lens",
1795183 : "magnifying-glass",
1795185 : "dollhouse",
1916711 : "marquee-lights",
1916713 : "flashlight",
1795188 : "lightning-rod",
1795189 : "coulombs-law",
1795187 : "flashing-neon-light",
1916719 : "power-lines",
1916715 : "telegraph",
1916716 : "electric-analogies",
1916712 : "touch-screen",
1916714 : "galvanometer",
1916717 : "field-lines",
1916731 : "particle-tracks",
1916721 : "doorbell",
1916720 : "electric-motor",
1916732 : "ac-transformer",
1916741 : "preschool-races",
1935122 : "atomic-colors",
1935124 : "subatomic-particle-zoo",
1935123 : "marie-curies-classroom",
1935126 : "radiocarbon-dating",
1935125 : "black-hole",
}

from paster_scripts import add_attachment_to_artifact as a
import os, traceback
from flx.lib import helpers as h

PDF_DIR = "/tmp/pdfs"

def run():
    cnt = 0
    errors = 0
    resourceIDs = []
    unique = {}
    duplicate = False
    for artifactID in MAPPING.keys():
        if not unique.has_key(artifactID):
            unique[artifactID] = True
        else:
            print "Duplicate artifactID: %s" % artifactID
            duplicate = True

    if duplicate:
        raise Exception("Duplicate artifact ids found.")

    for artifactID in MAPPING.keys():
        try:
            pdf = os.path.join(PDF_DIR, '%s.pdf' % MAPPING[artifactID])
            if not os.path.exists(pdf):
                raise Exception("No such file [%s] for artifact [%s]" % (pdf, artifactID))
            resourceID, isNew = a.run(artifactID, 'inlineworksheet', os.path.join(PDF_DIR, MAPPING[artifactID] + ".pdf"), artifactTypeName='simulationint', publish=True)
            cnt += 1
            if isNew:
                resourceIDs.append(resourceID)
        except Exception, e:
            print "Error!! %s" % str(e)
            traceback.print_exc()
            errors += 1
    print "Processed %d artifacts. Errors [%s]" % (cnt, errors)
    if resourceIDs:
        print "Uploading to boxviewer. len[%d], resourceIDs[%s]" % (len(resourceIDs), str(resourceIDs))
        h.uploadDocumentBatch(resource_ids=resourceIDs, wait=False)

