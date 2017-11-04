from flx.model import api
from flx.lib import helpers as h

subjectEIDs = {
        'mathematics': 'MAT',
        'arithmetic': 'MAT.ARI',
        'measurement': 'MAT.MEA',
        'algebra': 'MAT.ALG',
        'geometry': 'MAT.GEO',
        'trigonometry': 'MAT.TRG',
        'probability': 'MAT.PRB',
        'statistics': 'MAT.STA',
        'calculus': 'MAT.CAL',
        'science': 'SCI',
        'life science': 'SCI.BIO',
        'biology': 'SCI.BIO',
        'chemistry': 'SCI.CHE',
        'physics': 'SCI.PHY',
        'earth science': 'SCI.ESC',
        }

bookSubjects = {
    "CK.MAT.ENG.SE.1.Math-Grade-6": ['mathematics'],
    "CK.MAT.ENG.SE.1.Math-Grade-7": ['mathematics'],
    "CK.MAT.ENG.SE.1.Algebra-Basic": ['mathematics', 'algebra'],
    "CK.MAT.ENG.SE.1.Algebra-I": ['mathematics', 'algebra'],
    "CK.MAT.SPA.SE.1.Algebra-I": ['mathematics', 'algebra'],
    "TI.MAT.ENG.SE.1.Algebra-I": ['mathematics', 'algebra'],
    "CK.MAT.ENG.SE.1.Geometry-Basic": ['mathematics', 'geometry'],
    "CK.MAT.ENG.SE.1.Geometry": ['mathematics', 'geometry'],
    "TI.MAT.ENG.SE.1.Geometry": ['mathematics', 'geometry'],
    "CK.MAT.ENG.SE.1.Pythagorean-Theorem": ['mathematics', 'geometry'],
    "CK.MAT.ENG.SE.1.Trigonometry": ['mathematics', 'trigonometry'],
    "TI.MAT.ENG.SE.1.Trigonometry": ['mathematics', 'trigonometry'],
    "CK.MAT.ENG.SE.1.Prob-&-Stats-Basic-(Short-Course)": ['mathematics', 'probability', 'statistics'],
    "CK.MAT.ENG.SE.1.Prob-&-Stats-Basic-(Full-Course)":  ['mathematics', 'probability', 'statistics'],
    "CK.MAT.ENG.SE.1.Prob-&-Stats-Adv": ['mathematics', 'probability', 'statistics'],
    "CK.MAT.ENG.SE.1.Math-Analysis": 'mathematics',
    "TI.MAT.ENG.SE.1.Calculus": ['mathematics', 'calculus'],
    "CK.SCI.ENG.SE.1.Life-Science-Honors": ['science', 'life science', 'biology'],
    "CK.SCI.ENG.SE.1.Human-Biology-Breathing": ['science', 'biology'],
    "CK.SCI.ENG.SE.1.Human-Biology-Your-Changing-Body": ['science', 'biology'],
    "CK.SCI.ENG.SE.1.Human-Biology-Circulation": ['science', 'biology'],
    "CK.SCI.ENG.SE.1.Human-Biology-Nutrition": ['science', 'biology'],
    "CK.SCI.ENG.SE.1.Human-Biology-Ecology": ['science', 'biology'],
    "CK.SCI.ENG.SE.1.Human-Biology-Genetics": ['science', 'biology'],
    "CK.SCI.ENG.SE.1.Human-Biology-Lives-of-Cells": ['science', 'biology'],
    "CK.SCI.ENG.SE.1.Human-Biology-Nervous-System": ['science', 'biology'],
    "CK.SCI.ENG.SE.1.Human-Biology-Reproduction": ['science', 'biology'],
    "CK.SCI.ENG.SE.1.Human-Biology-Sexuality": ['science', 'biology'],
    "CK.SCI.ENG.SE.1.Biology-I-Honors": ['science', 'biology'],
    "CK.SCI.ENG.SE.1.Chemistry": ['science', 'chemistry',],
    "CK.SCI.ENG.SE.1.Organic-Chemistry-Applications": ['science', 'chemistry'],
    "CK.SCI.ENG.SE.2.Physics-Basic": ['science', 'physics'],
    "CK.SCI.ENG.SE.2.Peoples-Physics": ['science', 'physics'],
    "CK.SCI.ENG.SE.1.Physics-People's-Physics-(Video)": ['science', 'physics'],
    "CK.SCI.ENG.SE.1.Physics-21st-Century": ['science', 'physics'],
    "CK.SCI.ENG.SE.1.Physics-Stargazers-to-Starships": ['science', 'physics', 'astronomy'],
    "CK.TEC.ENG.SE.1.Environment-Sustainable-Energy": ['technology', 'earth science'],
    "CK.EPR.ENG.SE.1.SAT-Prep-(Q&A-Key)": 'exam preparation',
    "CK.EPR.ENG.SE.1.SAT-Prep-II(Q&A-Explanations)": 'exam preparation',
    "CK.EPR.ENG.SE.1.SAT-Prep-III-(Q&A-Explanations)": 'exam preparation',
    "CK.EPR.ENG.SE.1.SAT-Prep-III-(Q&A-Key)": 'exam preparation',
    "CK.SOC.ENG.SE.1.History-U.S.-Adv": ['social science', 'history'],
    "CK.SOC.ENG.SE.1.History-U.S.-Basic": ['social science', 'history'],
    "CK.LIB.ENG.SE.1.Composition-Glyfada-Method": ['english', 'writing'],
    "CK.LNG.ENG.SE.1.Basic-Speller": ['english', 'spelling'],
    "CK.TEC.ENG.SE.1.Economics-Project-Based": 'economics',
    "CK.ENG.ENG.SE.1.Engineering-HS": 'engineering',
    "CK.ENG.ENG.SE.1.Engineering-Matlab": 'engineering',
    "CK.SCI.ENG.SE.1.Nanotechnology-NanoLeap": ['technology', 'nanotechnology'],
    "CK.SCI.ENG.SE.1.Science-Authoring-(Guide)": ['science'],
    "CK.EPR.ENG.SE.1.SAT-Prep-(Q&A-Explanations)": ['exam preparation'],
    "CK.SCI.ENG.SE.1.Biodiversity": ['science', 'biology'],
    "CK.MAT.ENG.SE.1.Algebra-Explorations-K-7": ['mathematics', 'algebra'],
    "CK.SCI.ENG.SE.1.Biology-CA-DTI3": ['science', 'biology'],
    "CK.MAT.ENG.SE.1.Calculus": ['mathematics', 'calculus'],
    "CK.SCI.ENG.SE.1.Chemistry-CA-DTI3": ['science', 'chemistry'],
    "CK.SCI.ENG.SE.1.Introductory-Chemistry": ['science', 'chemistry'],
    "CK.SCI.ENG.SE.1.Biology-I-Hon-CA-DTI3": ['science', 'biology'],
    "CK.LIB.ENG.SE.1.Composition-Commonsense": ['english', 'writing'],
    "CK.MAT.ENG.SE.1.Algebra-II": ['mathematics', 'algebra'],
    "CK.MAT.ENG.SE.2.Algebra-I": ['mathematics', 'algebra'],
    "CK.SCI.ENG.SE.1.Biology": ['science', 'biology'],
    "CK.SCI.ENG.SE.2.Chemistry": ['science', 'chemistry'],    
    "CK.MAT.ENG.SE.2.Trigonometry": ['mathematics', 'trigonometry'],
    "CK.MAT.ENG.SE.2.Prob-&-Stats-Adv": ['mathematics', 'probability', 'statistics'],
    "CK.MAT.SPA.SE.1.Geometry": ['mathematics', 'geometry'],
    "CK.MAT.ENG.SE.2.Geometry": ['mathematics', 'geometry'],
    "CK.SCI.ENG.SE.1.Basic-Physics": ['science', 'physics'],
    "CK.SCI.ENG.SE.1.Earth-Science-MS": ['science', 'earth science'],
    "CK.SCI.ENG.SE.1.Nanotechnology-NanoSense": ['technology', 'nanotechnology'],
    "CK.EPR.ENG.SE.1.SAT-Prep-II(Q&A-Key)": 'exam preparation',
    "CK.SCI.ENG.SE.1.Earth-Science-Honors": ['science', 'earth science'],
    "CK.MAT.ENG.SE.1.CK-12-Concept-Basic-Algebra": ['mathematics', 'algebra'],
    "CK.MAT.ENG.SE.1.CK-12-Concept-Basic-Geometry": ['mathematics', 'geometry'],
    "CK.MAT.ENG.SE.1.CK-12-Concept-Basic-Probability-and-Statistics---A-Full-Course": ['mathematics', 'probability', 'statistics'],
    "CK.SCI.ENG.SE.1.CK-12-Concept-Earth-Science": ['science', 'earth science'],
    "CK.SCI.ENG.SE.1.CK-12-Concept-Biology": ['science', 'biology'],
    "CK.SCI.ENG.SE.1.Concept-People's-Physics-Book-2ed": ['science', 'physics'],
    "CK.SCI.ENG.SE.1.Life-Science-MS": ['science', 'life science', 'biology'],
    "CK.SCI.ENG.SE.1.Earth-Science-HS": ['science', 'earth science'],
    ## OTHER BOOKS
    "CK.MAT.ENG.TE.1.Algebra-I": ['mathematics', 'algebra'],
    "TI.MAT.ENG.TE.1.Algebra-I": ['mathematics', 'algebra'],
    "CK.MAT.ENG.TE.1.Geometry-Basic": ['mathematics', 'geometry'],
    "CK.MAT.ENG.TE.1.Geometry": ['mathematics', 'geometry'],
    "CK.MAT.ENG.TE.1.Geometry-College-Access": ['mathematics', 'geometry'],
    "CK.MAT.ENG.TE.1.Trigonometry": ['mathematics', 'trigonometry'],
    "CK.MAT.ENG.TE.1.Prob-&-Stats-Adv": ['mathematics', 'probability', 'statistics'],
    "CK.MAT.ENG.TE.1.Calculus": ['mathematics', 'calculus'],
    "CK.SCI.ENG.TE.1.Earth-Science-Honors": ['science', 'earth science'],
    "CK.SCI.ENG.TE.1.Life-Science-Honors": ['science', 'life science', 'biology'],
    "CK.SCI.ENG.TE.1.Biology": ['science', 'biology'],
    "CK.SCI.ENG.TE.1.Biology-I-Honors": ['science', 'biology'],
    "CK.SCI.ENG.TE.1.Chemistry-Teacher-Resource-Guide": ['science', 'chemistry'],
    "CK.LNG.ENG.TE.1.Basic-Speller": ['english', 'spelling'],
    "CK.SCI.ENG.TE.1.Nanotechnology-NanoLeap": ['technology', 'nanotechnology'],
    "CK.LIB.ENG.TE.1.College-Access-Readers": ['english', 'exam preparation'],
    "CK.SCI.ENG.TE.1.Human-Biology-Reproduction": ['science', 'biology'],
    "CK.SCI.ENG.TE.1.Human-Biology-Sexuality": ['science', 'biology'],
    "CK.SCI.ENG.TE.1.Human-Biology-Your-Changing-Body": ['science', 'biology'],
    "CK.SCI.ENG.TE.1.Human-Biology-Lives-of-Cells": ['science', 'biology'],
    "CK.SCI.ENG.TE.1.Human-Biology-Genetics": ['science', 'biology'],
    "CK.SCI.ENG.TE.1.Human-Biology-Nervous-System": ['science', 'biology'],
    "CK.SCI.ENG.TE.1.Human-Biology-Ecology": ['science', 'biology'],
    "CK.SCI.ENG.TE.1.Human-Biology-Circulation": ['science', 'biology'],
    "CK.SCI.ENG.TE.1.Human-Biology-Breathing": ['science', 'biology'],
    "CK.SCI.ENG.TE.1.Human-Biology-Nutrition": ['science', 'biology'],
    "CK.SCI.ENG.SE.1.Earth-Sci-Hon-MS-Common-Miscon": ['science', 'earth science'],
    "CK.SCI.ENG.TE.1.Earth-Sci-Hon-MS-Sci-Inquiry": ['science', 'earth science'],
    "CK.SCI.ENG.TE.1.Earth-Sci-Hon-MS-Enrichment": ['science', 'earth science'],
    "CK.SCI.ENG.TE.1.Earth-Sci-Hon-MS-Strategies-Diff-Instr": ['science', 'earth science'],
    "CK.MAT.ENG.TE.1.Trigonometry-Solution-Key": ['mathematics', 'trigonometry'],
    "CK.MAT.ENG.TE.1.Calculus-Problem-Solving": ['mathematics', 'calculus'],
    "CK.MAT.ENG.TE.1.Geometry-Teaching-Tips": ['mathematics', 'geometry'],
    "CK.MAT.ENG.TE.1.Geometry-Common-Errors": ['mathematics', 'geometry'],
    "CK.MAT.ENG.TE.1.Geometry-Enrichment": ['mathematics', 'geometry'],
    "CK.MAT.ENG.TE.1.Geometry-Diff-Instr": ['mathematics', 'geometry'],
    "CK.MAT.ENG.TE.1.Geometry-Problem-Solving": ['mathematics', 'geometry'],
    "CK.MAT.ENG.TE.1.Trigonometry-Teaching-Tips": ['mathematics', 'trigonometry'],
    "CK.MAT.ENG.TE.1.Trigonometry-Common-Errors": ['mathematics', 'trigonometry'],
    "CK.MAT.ENG.TE.1.Calculus-Teaching-Tips": ['mathematics', 'calculus'],
    "CK.MAT.ENG.TE.1.Calculus-Common-Errors": ['mathematics', 'calculus'],
    "CK.MAT.ENG.TE.1.ProbStat-Enrichment": ['mathematics', 'probability', 'statistics'],
    "CK.MAT.ENG.TE.1.ProbStat-Teaching-Tips": ['mathematics', 'probability', 'statistics'],
    "TI.MAT.ENG.TE.1.Geometry": ['mathematics', 'geometry'],
    "TI.MAT.ENG.TE.1.Calculus": ['mathematics', 'calculus'],
    "TI.MAT.ENG.TE.1.Trigonometry": ['mathematics', 'calculus'],
    "CK.SCI.ENG.TE.1.Nanotechnology-NanoSense": ['technology', 'nanotechnology'],
    "CK.SCI.ENG.TE.1.Life-Sci-MS": ['science', 'life science'],
    "CK.SCI.ENG.WB.1.Biology": ['science', 'biology'],
    "CK.SCI.ENG.WB.1.Biology-I-Honors": ['science', 'biology'],
    "CK.SCI.ENG.WB.1.Chemistry": ['science', 'chemistry'],
    "CK.SCI.ENG.LK.1.Chemistry": ['science', 'chemistry'],
}

def run():
    new = 0
    browseTerms = {}
    domainTerms = {}
    changedArtifacts = {}
    missingTerms = []
    bookArtifacts = {}
    for eid in bookSubjects.keys():
        try:
            artifact = api.getArtifactByEncodedID(encodedID=eid)
            if artifact:
                bookArtifacts[artifact.id] = artifact.id
                ids = [artifact.id]
                artifacts = [artifact]
                while artifacts:
                    artifact = artifacts.pop(0)
                    for child in artifact.revisions[0].children:
                        ids.append(child.child.artifact.id)
                        artifacts.append(child.child.artifact)

                if type(bookSubjects[eid]).__name__ != 'list':
                    terms = [bookSubjects[eid]]
                else:
                    terms = bookSubjects[eid]
                for id in ids:
                    subTerms = api.getArtifactHasBrowseTermsByType(artifactID=id, browseTermTypeID=3)
                    for st in subTerms:
                        api.deleteArtifactHasBrowseTerm(artifactID=id, browseTermID=st.browseTermID)
                    print "Deleted %d subject terms for id: %s" % (len(subTerms), id)
                for term in terms:
                    termEid = None
                    term = term.strip()
                    if term:
                        if term not in browseTerms:
                            bt = api.getBrowseTermByIDOrName(idOrName=term, type=3)
                            if bt:
                                browseTerms[term] = bt.id
                            else:
                                missingTerms.append(term)
                                kwargs = {'name': term, 'browseTermType': 3}
                                bt = api.createBrowseTerm(**kwargs)
                                browseTerms[term] = bt.id
                                print "Added subject type browseTerm: %s" % term
                        termEid = subjectEIDs.get(term.lower())
                        if termEid and not domainTerms.has_key(termEid):
                            bt = api.getBrowseTermByEncodedID(encodedID=termEid)
                            if bt:
                                domainTerms[termEid] = bt.id
                            else:
                                missingTerms.append(termEid)
                                print "!!! No such domain type browseTerm: %s" % termEid

                        for id in ids:
                            if not api.getArtifactHasBrowseTerm(artifactID=id, browseTermID=browseTerms[term]):
                                api.createArtifactHasBrowseTerm(artifactID=id, browseTermID=browseTerms[term])
                                new += 1
                                changedArtifacts[id] = id
                                print "Created artifact has browseTerms for id: %s" % id
                            if bookArtifacts.has_key(id) and termEid:
                                if not api.getArtifactHasBrowseTerm(artifactID=id, browseTermID=domainTerms[termEid]):
                                    api.createArtifactHasBrowseTerm(artifactID=id, browseTermID=domainTerms[termEid])
                                    new += 1
                                    changedArtifacts[id] = id
                                    print "Create artifact has domainTerms [%s] for id: %s" % (termEid, id)
        except Exception as e:
            print "Exception: %s" % str(e)
    if changedArtifacts:
        h.reindexArtifacts(artifactIds=changedArtifacts.keys())
    print "Created new associations: %d" % new
    print "Missing terms: %s" % str(missingTerms)

