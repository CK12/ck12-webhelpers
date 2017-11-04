BROKER_URL = "redis://localhost:6379/1"

CELERYD_CONCURRENCY = 3
CELERYD_TASK_SOFT_TIME_LIMIT = 29800
CELERYD_TASK_TIME_LIMIT = 30000
CELERY_DISABLE_RATE_LIMITS = True

CELERY_RESULT_BACKEND = "redis"
CELERY_REDIS_HOST = "localhost"
CELERY_REDIS_PORT = 6379
CELERY_REDIS_DB = 1

CELERY_ENABLE_UTC = False

CELERY_QUEUES = {
        "celery": {
            "exchange": "celery",
            "exchange_type": "direct",
        },
        "print": {
            "exchange": "print",
            "exchange_type": "direct",
            "binding_key": "print"
        },
        "xdt": {
            "exchange": "xdt",
            "exchange_type": "direct",
            "binding_key": "xdt"
        },
        "search": {
            "exchange": "search",
            "exchange_type": "direct",
            "binding_key": "search"
        },
        "artifact": {
            "exchange": "artifact",
            "exchange_type": "direct",
            "binding_key": "artifact"
        },
        "importer": {
            "exchange": "importer",
            "exchange_type": "direct",
            "binding_key": "importer",
        },
        "migrator": {
            "exchange": "migrator",
            "exchange_type": "direct",
            "binding_key": "migrator",
        },
        "notifier": {
            "exchange": "notifier",
            "exchange_type": "direct",
            "binding_key": "notifier",
        },
        "iss": {
            "exchange": "iss",
            "exchange_type": "direct",
            "binding_key": "iss",
        },
        "ml": {
            "exchange": "ml",
            "exchange_type": "direct",
            "binding_key": "ml",
        },
}

CELERY_ROUTES = (
        { "flx.controllers.celerytasks.epub.epub": {
            "queue": "print",
            "routing_key": "print"
            }
        },
        { "flx.controllers.celerytasks.mobi.mobi": {
            "queue": "print",
            "routing_key": "print"
            }
        },
        { "flx.controllers.celerytasks.mathcache.MathCacheTask": {
            "queue": "print",
            "routing_key": "print"
            }
        },
        { "flx.controllers.celerytasks.epub.stitch": {
            "queue": "print",
            "routing_key": "print"
            }
        },
        { "flx.controllers.celerytasks.pdf.pdf": {
            "queue": "print",
            "routing_key": "print"
            }
        },
        { "flx.controllers.celerytasks.worksheet.worksheet": {
            "queue": "print",
            "routing_key": "print"
            }
        },
        { "flx.controllers.celerytasks.data.updatemembergroups.MemberGroupUpdateTask": {
            "queue": "print",
            "routing_key": "print"
            }
        },
        { "flx.controllers.celerytasks.data.updatememberlocations.MemberLocationTask": {
            "queue": "print",
            "routing_key": "print"
            }
        },
        { "flx.controllers.celerytasks.data.updatememberschoollocations.MemberSchoolLocationTask": {
            "queue": "print",
            "routing_key": "print"
            }
        },
        { "flx.controllers.celerytasks.data.recordmemberlocationsfromgroup.MemberGroupTask": {
            "queue": "print",
            "routing_key": "print"
            }
        },
        { "flx.controllers.celerytasks.data.recordmemberlocationsfromip.MemberIPTask": {
            "queue": "print",
            "routing_key": "print"
            }
        },
        { "flx.controllers.celerytasks.data.recordmemberschoollocationsfromgroup.MemberSchoolGroupTask": {
            "queue": "print",
            "routing_key": "print"
            }
        },
        { "flx.controllers.celerytasks.data.generatememberlocations.MemberLocationsAll": {
            "queue": "print",
            "routing_key": "print"
            }
        },
        { "flx.controllers.celerytasks.importer.ContentLoader": {
            "queue": "importer",
            "routing_key": "importer"
            }
        },
        { "flx.controllers.celerytasks.importer.ImageProcessor": {
            "queue": "importer",
            "routing_key": "importer"
            }
        },
        { "flx.controllers.celerytasks.importer.WikiImporter": {
            "queue": "importer",
            "routing_key": "importer"
            }
        },
        { "flx.controllers.celerytasks.gdt.GdtTask": {
            "queue": "print",
            "routing_key": "print"
            }
        },
        { "flx.controllers.celerytasks.gdt2epub.Gdt2ePubTask": {
            "queue": "print",
            "routing_key": "print"
            }
        },
        { "flx.controllers.celerytasks.search.CreateIndex": {
            "queue": "search",
            "routing_key": "search"
            }
        },
        { "flx.controllers.celerytasks.search.CreateIndexWorker": {
            "queue": "search",
            "routing_key": "search"
            }
        },
        { "flx.controllers.celerytasks.search.DeleteIndex": {
            "queue": "search",
            "routing_key": "search"
            }
        },
        { "flx.controllers.celerytasks.search.Reindex": {
            "queue": "search",
            "routing_key": "search"
            }
        },
        { "flx.controllers.celerytasks.search.SyncIndex": {
            "queue": "search",
            "routing_key": "search"
            }
        },
        { "flx.controllers.celerytasks.artifact.memberViewedArtifactTask": {
            "queue": "artifact",
            "routing_key": "artifact"
            }
        },
        { "flx.controllers.celerytasks.artifact.assembleArtifactTask": {
            "queue": "artifact",
            "routing_key": "artifact"
            }
        },
        { "flx.controllers.celerytasks.artifact.FinalizeBookTask": {
            "queue": "artifact",
            "routing_key": "artifact"
            }
        },
        { "flx.controllers.celerytasks.artifact.deleteArtifactTask": {
            "queue": "artifact",
            "routing_key": "artifact"
            }
        },
        { "flx.controllers.celerytasks.ContentMover.UpdateeFlexUserArtifact": {
            "queue": "artifact",
            "routing_key": "artifact"
            }
        },
        { "flx.controllers.celerytasks.browseTerm.BrowseTermLoaderTask": {
            "queue": "artifact",
            "routing_key": "artifact"
            }
        },
        { "flx.controllers.celerytasks.standard.StandardsCorrelationLoaderTask": {
            "queue": "artifact",
            "routing_key": "artifact",
            }
        },
        { "flx.controllers.celerytasks.standard.StandardsLoaderTask": {
            "queue": "artifact",
            "routing_key": "artifact",
            }
        },
        { "flx.controllers.celerytasks.modality.ModalityLoaderTask": {
            "queue": "artifact",
            "routing_key": "artifact",
            }
        },
        { "flx.controllers.celerytasks.course.CourseArtifactLoaderTask": {
            "queue": "artifact",
            "routing_key": "artifact",
            }
        },
        { "flx.controllers.celerytasks.notifier.EmailNotifierTask": {
            "queue": "notifier",
            "routing_key": "notifier"
            }
        },
        { "flx.controllers.celerytasks.notifier.AssignmentPushNotifierTask": {
            "queue": "notifier",
            "routing_key": "notifier"
            }
        },
        { "flx.controllers.celerytasks.retrolation.RetrolationLoaderTask": {
            "queue": "artifact",
            "routing_key": "artifact"
            }
        },
        { "flx.controllers.celerytasks.xdt.XdtTask": {
            "queue": "xdt",
            "routing_key": "xdt"
            }
        },
        { "flx.controllers.celerytasks.phonehome.PhoneHomeTask": {
            "queue": "print",
            "routing_key": "print"
            }
        },
        { "flx.controllers.celerytasks.taskmaintainer.TasksMaintainerTask": {
            "queue": "print",
            "routing_key": "print"
            }
        },
        { "flx.controllers.celerytasks.flexr.Import1xBooks": {
            "queue": "migrator",
            "routing_key": "migrator"
            }
        },
        { "flx.controllers.celerytasks.webthumbnail.ThumbnailGenerationTask": {
            "queue": "print",
            "routing_key": "print"
            }
         },
         { "flx.controllers.celerytasks.documentLoader.DocumentLoaderTask": {
            "queue": "artifact",
            "routing_key": "artifact"
            }
        },
        { "flx.controllers.celerytasks.mongo.seometadata.SeoMetadataTask": {
            "queue": "artifact",
            "routing_key": "artifact"
            }
        },
        { "flx.controllers.celerytasks.mongo.relatedartifacts.createRelatedArtifacts": {
            "queue": "artifact",
            "routing_key": "artifact"
            }
        },
        { "flx.controllers.celerytasks.mongo.collection.SyncCollectionsTask": {
            "queue": "artifact",
            "routing_key": "artifact"
            }
        },
        { "flx.controllers.celerytasks.artifacturlvalidator.ArtifactUrlValidator": {
            "queue": "artifact",
            "routing_key": "artifact"
            }
        },
        { "flx.controllers.celerytasks.vocabulary.QuickVocabularyLoaderTask": {
            "queue": "artifact",
            "routing_key": "artifact"
            }
        },
        { "flx.controllers.celerytasks.vocabulary.VocabularyLoaderTask": {
            "queue": "artifact",
            "routing_key": "artifact"
            }
        },
        { "flx.controllers.celerytasks.compressImages.CompressImagesTask": {
            "queue": "iss",
            "routing_key": "iss"
            }
        },
        { "flx.controllers.celerytasks.persist_content_model.PersistContentModel": {
            "queue": "ml",
            "routing_key": "ml"
            }
        },
        { "flx.controllers.celerytasks.compute_content_similarity.ComputeContentSimilarity": {
            "queue": "ml",
            "routing_key": "ml"
            }
        },
        { "flx.controllers.celerytasks.mongo.artifactvisits_curator.ArtifactVisitsCuratorTask": {
            "queue": "artifact",
            "routing_key": "artifact"
            }
        },        
)
