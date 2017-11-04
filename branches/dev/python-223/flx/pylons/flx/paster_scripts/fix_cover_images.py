import os
import urllib
import urllib2
import re
from datetime import datetime
import glob
import random

from flx.model import api
from flx.lib import helpers

def create_and_associate_coverimage(artifact, cover_image_path):
    artifactRevision = artifact.revisions[0]
    resourceDict = {}
    path, name = os.path.split(cover_image_path)
    resourceDict['uri'] = open(cover_image_path, "rb")
    resourceDict['uriOnly'] = False
    resourceDict['isExternal'] = False
    resourceDict['resourceType'] = api.getResourceTypeByName(name='cover page')
    resourceDict['name'] = name
    resourceDict['description'] = None
    language = api.getLanguageByName(name='English')
    resourceDict['languageID'] = language.id
    resourceDict['ownerID'] = 3
    resourceDict['creationTime'] = datetime.now()
    resourceRevision = api.createResource(resourceDict=resourceDict,
                                          commit=True)
    artifactRevisionHasResource = api.createArtifactHasResource(artifactRevisionID=artifactRevision.id,
                                  resourceRevisionID=resourceRevision.id)

def fix_low_resolution_covers():
    for eachID in api.getPublishedBooksIDs():
        artifact = api.getArtifactByID(id=eachID)
        print 'Checking artifact: %s' %(artifact.id)
        coverImageUri = artifact.getCoverImageUri()
        if coverImageUri and coverImageUri.find('thumb.jpg') >= 0:
            print 'Fixing cover image for artifact with ID: %s, title: %s' %(artifact.id, artifact.getTitle())
            highResCoverImageName = coverImageUri.split('/')[-1].replace('_thumb', '')
            if highResCoverImageName.startswith('File-3A'):
                highResCoverImageName = highResCoverImageName.replace('File-3A', '')

            #Step 1: Download the full resolution image from wiki
            wiki_url = 'http://authorsr.ck12.org/'
            wiki_fileinfo_url = wiki_url + 'wiki/index.php/File:%s' %(highResCoverImageName)
            downloadDirectory = '/tmp/cover_images'
            if not os.path.exists(downloadDirectory):
                os.mkdir(downloadDirectory)
            req = urllib2.Request(wiki_fileinfo_url, headers={'User-Agent' : "CK12 Browser"})
            f = urllib2.urlopen(req)
            if f.code == 200:
                content = f.read()
                reObj = re.compile('<a href="(.*?)" class="internal" title="(.*?)">Full resolution</a>')
                downloadUri = reObj.findall(content)[0][0]
                print '\t Downloading: %s into %s' %(wiki_url + downloadUri, downloadDirectory)
                urllib.urlretrieve(wiki_url + downloadUri, downloadDirectory + '/' + highResCoverImageName)
            else:
                print '\t Full resolution cover image does not exist. Skipping...'
                continue

            #Step 2: Delete the cover page for the resource
            artifactRevision = artifact.revisions[0]
            resourceRevision = artifact.getResourceRevision(artifactRevision, 'cover page')
            api.deleteArtifactHasResource(artifactRevisionID=artifactRevision.id, resourceRevisionID=resourceRevision.id)
            api.deleteResource(resource=resourceRevision.resource)

            #Step 3: Create the cover page resource and associate with the book artifact
            create_and_associate_coverimage(artifact, downloadDirectory + '/' +
                                            highResCoverImageName)


def replace_default_covers(cover_image_path):
    for eachID in api.getPublishedBooksIDs():
        artifact = api.getArtifactByID(id=eachID)
        print 'Checking artifact: %s' %(artifact.id)
        coverImageUri = artifact.getCoverImageUri()
        if not coverImageUri or coverImageUri.endswith('cover_flexbook_generic.png'):
            print 'Replacing the default cover image for artifact with ID: %s, title: %s' %(artifact.id, artifact.getTitle())

            create_and_associate_coverimage(artifact, cover_image_path)


def fix_default_covers():
    coverImagesDirectory = '/opt/2.0/flx/pylons/flx/data/images/generic_cover_images/'
    coverImages = glob.glob(coverImagesDirectory + '*.jpg')
    downloadDirectory = '/tmp/custom_cover_images/'
    if not os.path.exists(downloadDirectory):
        os.mkdir(downloadDirectory)
    coverImageTemplate = '/opt/2.0/flx/pylons/flx/data/images/CK12_CoverImage_Template.jpg'
    for eachID in api.getPublishedBooksIDs():
        artifact = api.getArtifactByID(id=eachID)
        print 'Checking artifact: %s' %(artifact.id)
        coverImageUri = artifact.getCoverImageUri()
        if not coverImageUri or coverImageUri.endswith('cover_flexbook_generic.png'):
            print 'Replacing the default cover image for artifact with ID: %s, title: %s' %(artifact.id, artifact.getTitle())
            outputCoverImage = downloadDirectory + 'custom_%s.jpg' %(artifact.getHandle())
            print outputCoverImage
            randomNumber = random.randint(0, len(coverImages)-1)
            helpers.createCustomCoverImage(coverImageTemplate,
                                           coverImages[randomNumber], artifact.getTitle(), outputCoverImage)
            create_and_associate_coverimage(artifact, outputCoverImage)


if __name__ == '__main__':
    fix_low_resolution_covers()
    print 'Done.'
