# -*- coding: utf-8 -*-

from flx.tests import *
from flx.model import api, meta, model
from flx.model.artifactDataManager import ArtifactDataModel
from flx.model.memberDataManager import MemberDataManager
import json
import logging
import base64

log = logging.getLogger(__name__)

INDEX_CREATED = False

class TestArtifactSaveController(TestController):

    member1_id = None
    titleSuffix = "1002"

    @classmethod
    def setUpClass(cls):
        super(TestArtifactSaveController, cls).setUpClass()
        # Delete user if exists in case something went wrong the last time.
        cls.delete_artifacts_for_member('testuser1')
        api.deleteMemberByLogin('testuser1')
        cls.member1 = api.createMember(gender='male',
                                       login='testuser1',
                                       defaultLogin='testuser1',
                                       stateID=2,
                                       authTypeID=1,
                                       token='youguessit',
                                       email='testuser1@ck12.org',
                                       givenName='Test',
                                       surname='User1',
                                       roleID=5,
                                       emailVerified=True,
                                       authID=1001
                                      )
        cls.member1.authID = cls.member1.id
        cls.member1 = api.updateMember(cls.member1)
        cls.member1_id = cls.member1.id

    @classmethod
    def tearDownClass(cls):
        cls.delete_artifacts_for_member('testuser1')
        api.deleteMemberByLogin('testuser1')

    @classmethod
    def delete_artifacts_for_member(cls, member_login):
        member = api.getMemberByLogin(member_login)
        if not member:
            return
        artifacts = api.getArtifactsByOwner(owner=member)
        if artifacts:
            for a in artifacts:
                try:
                    log.info("Deleting artifact: %d, %s, %s" % (a.id, a.name, a.type.name))
                    api.deleteArtifactAttributersByArtifactID(artifactID=a.id)
                    api.deleteArtifact(artifact=a, recursive=True)
                except Exception as ae:
                    log.warn("Error deleting artifact: %d, %s" % (a.id, str(ae)), exc_info=ae)
                    raise Exception('Error deleting artifact id: %d' % a.id)

    def test_createLessonArtifact(self):
        """
            1. Create a Lesson Artifact with the passed payload
                1.1 Only 1 revision should be created
                1.2 No concept artifact should be created (after Lesson-Concept merge)
        """
        session = meta.Session()
        userID = TestArtifactSaveController.member1_id
        cover_image_resource = session.query(model.Resource).filter_by(resourceTypeID=2, ownerID=3).first()
        artifactDict = {
                       "title":"Test Lesson Create" + self.titleSuffix,
                       "type":{
                          "name":"lesson"
                       },
                       "authors":[
                          {
                             "name":"Satish Kumar",
                             "role":{
                                 "name":"author"
                                },
                             "sequence":1
                          },
                          {
                             "name":"Test Author",
                             "role":{
                                "id":3
                                },
                             "sequence":2
                          }
                       ],
                       "description":"Test Description",
                       "tagTerms":[
                          {
                             "name":"TagTerm1"
                          },
                          {
                             "name":"TagTerm2"
                          }
                       ],
                       "searchTerms":[
                          {
                             "name":"SearchTerm1"
                          }
                       ],
                       "resources":[
                          {
                             "id":cover_image_resource.id #TODO: revisit
                          }
                       ],
                       "revisions":[
                          {
                             "contentRevision":{
                                "xhtml":"<p id=\"x-ck12-MjJjYTRmY2UxMDFjZjg0NTJkZGU5MmI5NjBjOGY2ZGM.-uwy\">Hello! This is some Test data.</p>"
                             }
                          }
                       ]
                    }
        session.expire_all()
        session.close()

        response = self.app.post(
            url(controller='artifactServiceManager', action='updateOrCreateArtifact'),
            params=base64.b64encode(json.dumps(artifactDict)),
            content_type='application/json',
            headers={'Cookie': self.getLoginCookie(userID)}
        )
        assert '"status": 0' in response, "Failed creating lesson artifact"
        
        # TODO: revisit these after Gandhi's api merge
        j = json.loads(response.normal_body)
        #lessonID = j['response']['artifact']['id']
        lessonID = j['response']['artifact']['artifactID']
#         origLessonID = lessonID
        session = meta.Session()
        lessonArtifactDO = ArtifactDataModel.getArtifactById(session=session, id=lessonID)
        assert lessonArtifactDO
        assert len(lessonArtifactDO.revisions) == 1
        #No Concept child created
        assert len(lessonArtifactDO.revisions[0].children) == 0
        session.expire_all()
        session.close()

        #api.deleteArtifactByID(id=lessonID, recursive=False)

    def test_updateLessonArtifact(self):
        """
            1. Create a Lesson Artifact with passed payload
                1.1 Only 1 revision should be created
                1.2 No concept artifact should be created (after Lesson-Concept merge)
            2. Update the contents, Title
                2.1 Contents Updated, so 2 revisions should be created
            3. Update authors, tagterms, searchTerms, description
                3.1 No new revision should be created
                3.2 Check if description is updated
        """
        session = meta.Session()
        cover_image_resource = session.query(model.Resource).filter_by(resourceTypeID=2, ownerID=3).first()
        userID = TestArtifactSaveController.member1_id

        artifactDict = {  
           "title":"Test Lesson Create" + self.titleSuffix,
           "type":{  
              "name":"lesson"
           },
           "authors":[  
              {  
                 "name":"Satish Kumar",
                 "role":{  
                    "id": 3,
                    "name": "author"
                 },
                 "sequence":1
              },
              {  
                 "name":"Test Author",
                 "role":{  
                    "name":"editor"
                 },
                 "sequence":2
              }
           ],
           "description":"Test Description",
           "tagTerms":[  
              {  
                 "name":"TagTerm1"
              },
              {  
                 "name":"TagTerm2"
              }
           ],
           "searchTerms":[  
              {  
                 "name":"SearchTerm1"
              }
           ],
           "browseTerms":[  
              #{  
              #   "id":3 #TODO: revisit
              #}
           ],
           "resources":[  
              {  
                 "id":cover_image_resource.id #TODO: revisit
              }
           ],
           "revisions":[  
              {  
                 "contentRevision":{  
                    "xhtml":"<p id=\"x-ck12-MjJjYTRmY2UxMDFjZjg0NTJkZGU5MmI5NjBjOGY2ZGM.-uwy\">Hello Satish! What's up</p>"
                 }
              }
           ]
        }
        session.expire_all()
        session.close()

        response = self.app.post(
            url(controller='artifactServiceManager', action='updateOrCreateArtifact'),
            params=base64.b64encode(json.dumps(artifactDict)),
            content_type='application/json',
            headers={'Cookie': self.getLoginCookie(userID)}
        )
        assert '"status": 0' in response, "Failed creating lesson artifact"
        # TODO: revisit these after Gandhi's api merge
        j = json.loads(response.normal_body)
#         lessonID = j['response']['artifact']['id']
        lessonID = j['response']['artifact']['artifactID']
        origLessonID = lessonID
        session = meta.Session()
        lessonArtifactDO = ArtifactDataModel.getArtifactById(session=session, id=lessonID)
        assert lessonArtifactDO
        assert len(lessonArtifactDO.revisions) == 1
        # No Concept child created
        assert len(lessonArtifactDO.revisions[0].children) == 0
        newTitle = "Test Lesson Create Title Changed" + self.titleSuffix
        artifactDict = {  
           "title": newTitle,
           "id" : lessonArtifactDO.id,
           "revisions":[  
              {  
                 "contentRevision":{  
                    "xhtml":"<p id=\"x-ck12-MjJjYTRmY2UxMDFjZjg0NTJkZGU5MmI5NjBjOGY2ZGM.-uwy\">Hello Satish! What's up! Content Updated</p>"
                 }
              }
           ]
        }
        
        response = self.app.post(
            url(controller='artifactServiceManager', action='updateOrCreateArtifact'),
            params=base64.b64encode(json.dumps(artifactDict)),
            content_type='application/json',
            headers={'Cookie': self.getLoginCookie(userID)}
        )
 
        assert '"status": 0' in response, "Failed updating lesson artifact"
        # TODO: revisit these after Gandhi's api merge
        j = json.loads(response.normal_body)
#         lessonID = j['response']['artifact']['id']
        lessonID = j['response']['artifact']['artifactID']

        session.expire_all()
        session.close()
        session = meta.Session()

        lessonArtifactDO = ArtifactDataModel.getArtifactById(session=session, id=lessonID)
        assert lessonArtifactDO
        assert len(lessonArtifactDO.revisions) == 2, "Artifact should have 2 revisions after update as content is updated"
        # No Concept child created
        assert len(lessonArtifactDO.revisions[0].children) == 0, "Lesson Artifact shouldn't have any children"
        assert lessonID == origLessonID, "Lesson Artifact Updated not same as Lesson Artifact Created "
        assert lessonArtifactDO.name == newTitle, "Title Update failed"
        newDescription = "Test Description Updated"
        artifactDict = {
           "id" : lessonArtifactDO.id,
           "authors":[  
              {  
                 "name":"Satish Kumar",
                 "role":{  
                    "id":3,
                    "name":"author"
                 },
                 "sequence":1 # TODO: revisit
              },
              {  
                 "name":"Test Author1",
                 "role":{  
                    "name":"author"
                 },
                 "sequence":2
              }
           ],
           "description":newDescription,
           "tagTerms":[  
              {  
                 "name":"TagTerm1"
              },
              {  
                 "name":"TagTerm3"
              }
           ],
           "searchTerms":[  
              {  
                 "name":"SearchTerm2"
              }
           ]
        }

        session.expire_all()
        session.close()

        response = self.app.put(
            url(controller='artifactServiceManager', action='updateOrCreateArtifact'),
            params=base64.b64encode(json.dumps(artifactDict)),
            content_type='application/json',
            headers={'Cookie': self.getLoginCookie(userID)}
        )
         
        assert '"status": 0' in response, "Failed updating lesson artifact"
        j = json.loads(response.normal_body)
        #lessonID = j['response']['artifact']['id']
        lessonID = j['response']['artifact']['artifactID']
        session = meta.Session()
        lessonArtifactDO = ArtifactDataModel.getArtifactById(session=session, id=lessonID)
        assert lessonArtifactDO
        #assert len(lessonArtifactDO.revisions) == 2, "Artifact should have 2 revisions after update as content is not updated"
        # No Concept child created
        #assert len(lessonArtifactDO.revisions[0].children) == 0, "Lesson Artifact shouldn't have any children"
        assert lessonID == origLessonID, "Lesson Artifact Updated not same as Lesson Artifact Created "
        assert lessonArtifactDO.description == newDescription, "Description Update failed"

        session.expire_all()
        session.close()
        #api.deleteArtifact(session, artifact=lessonArtifactDO, recursive=False)

    def getArtifactByTypeNotOwnedByUser(self, session, type, userID):
        artifactTypeDO = ArtifactDataModel.getArtifactTypeByName(session, type)
        return session.query(model.Artifact).filter(model.Artifact.artifactTypeID == artifactTypeDO.id,
                                                    model.Artifact.creatorID != userID).first()

    def test_copyLessonArtifact(self):
        """
            1. Update Lesson for which Owner != User
                1.1 New Lesson artifact should be created which is a copy of passed artifact
        """
        session = meta.Session()
        userID = TestArtifactSaveController.member1_id
        source_artifactDO = self.getArtifactByTypeNotOwnedByUser(session=session, type='lesson', userID=userID)
        if not source_artifactDO:
            return
        source_artifact_id, source_artifact_description = source_artifactDO.id, source_artifactDO.description
        title = "Test Copy Lesson" + self.titleSuffix
        artifactDict = {  
           "title": title,
           "id": source_artifact_id
        }
        
        response = self.app.post(
            url(controller='artifactServiceManager', action='updateOrCreateArtifact'),
            params=base64.b64encode(json.dumps(artifactDict)),
            content_type='application/json',
            headers={'Cookie': self.getLoginCookie(userID)}
        )
        
        assert '"status": 0' in response, "Failed updating lesson artifact"
        j = json.loads(response.normal_body)
        lessonID = j['response']['artifact']['artifactID']
        lessonArtifactDO = ArtifactDataModel.getArtifactById(session=session, id=lessonID)
        assert lessonArtifactDO
        assert source_artifact_id != lessonArtifactDO.id, "Copying of artifact not done"
        assert len(lessonArtifactDO.revisions) == 1, "Artifact should have 1 revision after copy"
        assert lessonArtifactDO.description == source_artifact_description, "Description Update failed"
        assert lessonArtifactDO.name == title, "Title update failed"
        session.expire_all()
        session.close()
        # TODO: add additional checks

    def test_createUpdateBookArtifact(self):
        """
            1. Create a Book Artifact
                1.1 Add a existing Chapter to the Book
                1.2 Create Chapter within the book
                    1.2.1 Create Lesson within the Chapter
                    1.2.2 Add existing Lesson to the Chapter
            2. Update a Lesson within a chapter within a book
                -> After the update there should be 2 revisions for the book artifact
            3. Reorder chapters within the book
                -> New Revision of the book has to be created
                -> Chapters should be reordered
            4. Delete a Chapter within the book
                -> New Revision of the book has to be created
                -> There should be just 1 chapter left in the book
        """
        session = meta.Session()
        userID = TestArtifactSaveController.member1_id
        chapterArtifactDO = self.getArtifactByTypeNotOwnedByUser(session=session, type='chapter', userID=userID)
        lessonArtifactDO = self.getArtifactByTypeNotOwnedByUser(session=session, type='lesson', userID=userID)
        if not chapterArtifactDO or not lessonArtifactDO:
            return
        artifactDict = {
           "title":"Test Own Book Create" + self.titleSuffix,
           "type":{  
              "name":"book"
           },
           "authors":[  
              {  
                 "name":"Rahul Author",
                 "role":{  
                    "id":3,
                 },
                 "sequence":1
              },
              {  
                 "name":"Test Contributor",
                 "role":{  
                    "name": "contributor"
                 },
                 "sequence":2
              }
           ],
           "description":"New Description 2",
           "tagTerms":[  
              {  
                 "name":"ta3"
              },
              {  
                 "name":"ta5"
              }
           ],
           "searchTerms":[  
              {  
                 "name":"search121"
              }
           ],
           "revisions":[  
              {  
                 "contentRevision":{  
                    "xhtml":"<p id=\"x-ck12-MjJjYTRmY2UxMDFjZjg0NTJkZGU5MmI5NjBjOGY2ZGM.-uwy\">Book Contents</p>"
                 },
                 "children":[  
                    {  
                       "id":chapterArtifactDO.id # TODO: dont hardcode - find this artifact revision id
                    },
                    {  
                       "title":"Own Chapter 2",
                       "forUpdate":True,
                       "type":{  
                          "name":"chapter"
                       },
                       "revisions":[  
                          {  
                             "contentRevision":{  
                                "xhtml":"<body><div class=\"x-ck12-data\"><p class=\"\"><span style=\"font-size: 12.96px; \
                                line-height: 19.44px;\">chapter introduction</span></p></div>   \
                                             <div class=\"x-ck12-data-lesson\"><!-- <lessons /> --></div>           \
                                                  <div class=\"x-ck12-data\"><p class=\"\">chapter summary</p></div>                </body>"
                             },
                             "children":[  
                                {  
                                   "title":"Own Lesson Chapter 2",
                                   "type":{  
                                      "name":"lesson"
                                    },
                                   "forUpdate":True,
                                   "authors":[  
                                      {  
                                         "name":"Satish Author",
                                         "role":{  
                                            "id":3,
                                            "name": "author"
                                            },
                                         "sequence":1
                                      },
                                      {  
                                         "name":"Test Author2",
                                         "role":{  
                                            "name":"translator"
                                            },
                                         "sequence":2
                                      }
                                   ],
                                   "description":"New Description 2",
                                   "tagTerms":[  
                                      {  
                                         "name":"ta1"
                                      },
                                      {  
                                         "name":"ta2"
                                      }
                                   ],
                                   "searchTerms":[  
                                      {  
                                         "name":"search1"
                                      }
                                   ],
                                   "revisions":[  
                                      {  
                                         "contentRevision":{  
                                            "xhtml":"<p id=\"x-ck12-MjJjYTRmY2UxMDFjZjg0NTJkZGU5MmI5NjBjOGY2ZGM.-uwy\">Hello Satish! What's up</p>"
                                         }
                                      }
                                   ]
                                },
                                {  
                                   "id":lessonArtifactDO.id # TODO: revisit
                                }
                             ]
                          }
                       ]
                    }
                 ]
              }
           ]
        }
        session.expire_all()
        session.close()

        response = self.app.post(
            url(controller='artifactServiceManager', action='updateOrCreateArtifact'),
            params=base64.b64encode(json.dumps(artifactDict)),
            content_type='application/json',
            headers={'Cookie': self.getLoginCookie(userID)}
        )
        #assert 1 == 2, "Failing Test Deliberately"  
        assert '"status": 0' in response, "Failed creating book artifact"
        # TODO: Revisit after Gandhi's api merge
        j = json.loads(response.normal_body)
        bookID = j['response']['artifact']['artifactID']


        session = meta.Session()

        bookArtifactDO = ArtifactDataModel.getArtifactById(session=session, id=bookID)
        origBookArtifactDO = bookArtifactDO
        origBookArtifact_id, origBookArtifact_handle = origBookArtifactDO.id, origBookArtifactDO.handle
        assert bookArtifactDO, "create book failed"
        assert len(bookArtifactDO.revisions) == 1, "Create case for book, there should be only 1 revision"
        assert len(bookArtifactDO.revisions[0].children) == 2, "Chapter update within book failed"


        #
        # Updating Lesson within the book @2.1
        #
        title = "Test Lesson Update within a book" + self.titleSuffix
        artifactDict = {
           "title":title,
            "type":{
                    "name":"lesson"
            },
           "revisions":[  
              {  
                 "contentRevision":{  
                    "xhtml":"<p id=\"x-ck12-MjJjYTRmY2UxMDFjZjg0NTJkZGU5MmI5NjBjOGY2ZGM.-uwy\">Changing content for Lesson within a book</p>"
                 }
              }
           ]
        }

        memberDO = MemberDataManager.getMemberbyID(session, userID)
        response = self.app.post(
            url(controller='artifactServiceManager', action='updateArtifact', artifactType='book', 
                artifactHandle=origBookArtifact_handle,
                artifactCreator=memberDO.login,
                artifactDescendantIdentifier='2.1'),
            params=base64.b64encode(json.dumps(artifactDict)),
            content_type='application/json',
            headers={'Cookie': self.getLoginCookie(userID)}
        )
        
        assert '"status": 0' in response, "Failed updating Lesson within a book"
        # TODO: Revisit after Gandhi's api merge
        j = json.loads(response.normal_body)
        bookID = j['response']['artifact']['context']['id']

        session.expire_all()
        session.close()
        session = meta.Session()

        bookArtifactDO = ArtifactDataModel.getArtifactById(session=session, id=bookID)
        assert bookArtifactDO, "update lesson within book failed"
        assert origBookArtifact_id == bookArtifactDO.id, "Different artifact updated"
        assert len(bookArtifactDO.revisions) == 2, "There should be 2 revisions for book since lesson's contents were updated"
        assert len(bookArtifactDO.revisions[0].children) == 2, "There should still be 2 chapters within the book"
        origChildRevisionDOs = [revRel.child for revRel in bookArtifactDO.revisions[0].children]
        origChild0_id, origChild1_id = origChildRevisionDOs[0].id, origChildRevisionDOs[1].id

        #
        # Reorder chapters within book
        #
        memberDO = MemberDataManager.getMemberbyID(session, userID)
        artifactDict = {  
           "title":"Test Own Book Create" + self.titleSuffix,
           "type":{  
              "name":"book"
           },
           "revisions":[  
              {  
                 "children":[  
                    {  
                       "revisionID":origChild1_id # TODO: dont hardcode - find this artifact revision id
                    },
                    {  
                       "revisionID":origChild0_id
                    }
                 ]
              }
           ]
        }
        
        response = self.app.post(
            url(controller='artifactServiceManager', action='updateArtifact', artifactType='book', 
                artifactHandle=origBookArtifact_handle,
                artifactCreator=memberDO.login),
            params=base64.b64encode(json.dumps(artifactDict)),
            content_type='application/json',
            headers={'Cookie': self.getLoginCookie(userID)}
        )
        
        assert '"status": 0' in response, "Reorder of chapters within book failed"
        # TODO: Revisit after Gandhi's api merge
        j = json.loads(response.normal_body)
        bookID = j['response']['artifact']['artifactID']

        session.expire_all()
        session.close()
        session = meta.Session()

        bookArtifactDO = ArtifactDataModel.getArtifactById(session=session, id=bookID)
        assert bookArtifactDO, "Reorder of chapters within book failed"
        assert origBookArtifact_id == bookArtifactDO.id, "Different artifact updated"
        assert len(bookArtifactDO.revisions) == 3, "There should be 3 revisions for book since order of chapters is changed"
        assert len(bookArtifactDO.revisions[0].children) == 2, "There should still be 2 chapters within the book"
        childRevisionDOs = [revRel.child for revRel in bookArtifactDO.revisions[0].children]
        assert childRevisionDOs[0].id == origChild1_id, "Reorder of chapters within book failed"
        assert childRevisionDOs[1].id == origChild0_id, "Reorder of chapters within book failed"


        #
        # deleting a chapter within a book
        #
        memberDO = MemberDataManager.getMemberbyID(session, userID)
        artifactDict = {
           "title":"Test Own Book Create" + self.titleSuffix,
           "type":{  
              "name":"book"
           },
           "revisions":[  
              {  
                 "children":[  
                    {  
                       "revisionID":origChild1_id # TODO: don't hardcode - find this artifact revision id
                    }
                 ]
              }
           ]
        }
        
        response = self.app.post(
            url(controller='artifactServiceManager', action='updateArtifact', artifactType='book', 
                artifactHandle=origBookArtifact_handle,
                artifactCreator=memberDO.login
                ),
            params=base64.b64encode(json.dumps(artifactDict)),
            content_type='application/json',
            headers={'Cookie': self.getLoginCookie(userID)}
        )
        
        assert '"status": 0' in response, "Delete of chapter within book failed"
        # TODO: Revisit after Gandhi's api merge
        j = json.loads(response.normal_body)
        bookID = j['response']['artifact']['artifactID']

        session.expire_all()
        session.close()
        session = meta.Session()

        bookArtifactDO = ArtifactDataModel.getArtifactById(session=session, id=bookID)
        assert bookArtifactDO, "Delete of chapter within book failed"
        assert origBookArtifact_id == bookArtifactDO.id, "Different artifact updated"
        assert len(bookArtifactDO.revisions) == 4, "There should be 4 revisions for book since a chapter is deleted"
        assert len(bookArtifactDO.revisions[0].children) == 1, "There should be 1 chapter within the book"
        childRevisionDOs = [revRel.child for revRel in bookArtifactDO.revisions[0].children]
        assert childRevisionDOs[0].id == origChild1_id, "Deletion of chapter within book failed"
        session.expire_all()
        session.close()
        # TODO: add more checks
