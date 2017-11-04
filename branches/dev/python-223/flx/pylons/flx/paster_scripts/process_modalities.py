from flx.controllers.celerytasks import modality as m

SHEETS = {
        '2012 Summer Student Modalities - UPLOAD': [
            'Basic Algebra Multimedia',
            'Basic Geometry Multimedia',
            'Basic Prob & Stats Multimedia',
            'Basic Math Flashcards',
            'Biology Multimedia',
            'Biology Flashcards',
            'Earth Science Multimedia',
            'Earth Science SG & Flashcards',
            'Physics Multimedia',
            'Physics Flashcards',
            'Summer 2011 SG',
            'ES Crit Thinking',
            'Bio Crit Thinking',
            'Phys Crit Thinking',
            'Math Crit Thinking',
            ],
        'Teacher Modalities Sept 7 Upload': [
            'AlgebraLitSept7',
            'AlgebraSupportingSept7',
            'BioLPSept7',
            'BioLitSept7',
            'BioSupportingSept7',
            'EartSciLitSept7',
            'EarthSciLPSept7',
            'EarthSciSupportingSept7',
            'GeoLitSept7',
            'GeoSupportingSept7',
            'ProbStatsLitSept7',
            'ProbStatsSupportingSept7',
            ],
        }

def run():
    for spreadsheet in SHEETS.keys():
        for worksheet in SHEETS[spreadsheet]:
            modalityLoader = m.ModalityLoaderTask()
            task = modalityLoader.delay(csvFilePath=None, googleDocumentName=spreadsheet, googleWorksheetName=worksheet, loglevel='INFO', user=3, toReindex=True)
            print task.task_id
            result = task.wait()
            print result

