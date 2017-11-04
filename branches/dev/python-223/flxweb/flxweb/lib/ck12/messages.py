#
# Copyright 2007-2011 CK-12 Foundation
#
# All rights reserved
#      
#
# Unless required by applicable law or agreed to in writing, software
# distributed under this License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
# implied.  See the License for the specific language governing
# permissions and limitations.
#
# This file originally written by Ravi Gidwani
#
# $Id$

from pylons.i18n.translation import _

#######################################
# Settings 
#######################################
ACC_SETTINGS_SAVE_SUCCESS = _( 'Your settings have been saved' )
ACC_SETTINGS_SAVE_ERROR = _( 'There was an error saving your settings. Please try again later' )

#######################################
# Account 
#######################################
ACCOUNT_LOGIN_FAILED = _( 'Login Failed' )
ACCOUNT_LOGIN_INVALID = _( 'Invalid email address and password!' )
 
##################################
# Exercise error report page
##################################
ERROR_REPORT_SAVE_FAILED = _("There was an error saving your error report. Please try again later") 
ERROR_REPORT_FORM_DISPLAY_FAILED = _("There was an error displaying error report form. Please try again later")

##################################
# ARTIFACT
##################################
ARTIFACT_ALREADY_EXISTS = _("An artifact with this title already exists, please enter a new title.") 
BOOK_ALREADY_EXISTS = _("We couldn't save this FlexBook&#174; textbook because there is already a book with the same title.")
BOOK_ALREADY_EXISTS_INBOX_ARCHIEVED = _("A FlexBook&#174; textbook with this title already exist in your Inbox or Archived, please enter a new title.")
CONCEPT_ALREADY_EXISTS = _("A resource with this title already exists in your library. Please enter a new title.")
EMPTY_ARTIFACT_TITLE = _("The title is empty or contains characters which are not supported by CK-12, please enter a new title.")
CHAPTER_ALREADY_EXISTS = _("A chapter with this title already exists, please enter a new title.") 
ARTIFACT_PUBLISH_REQUEST_EXISTS = _("You have already sent a publish request for this content.")
ARTIFACT_NOT_LATEST = _("Artifact you are trying to save is not latest.") 
BOOK_NOT_LATEST = _("FlexBook&#174; textbook you are trying to save is not latest.")
CONCEPT_NOT_LATEST = _("Concept you are trying to save is not latest.")
CHAPTER_NOT_LATEST = _("Chapter you are trying to save is not latest.") 
ARTIFACT_SAVE_UNKNOWN_ERROR = _("Unknown Error.")
BOOK_SAVE_UNKNOWN_ERROR = _("There was a problem saving the FlexBook&#174; textbook, please try again.")
ROSETTA_VALIDATION_FAILED = _("Content validation failed.")
IMAGE_ENDPOINT_VALIDATION_FAILED = _("Image(s) got absolute URLs which are not allowed.")
DUPLICATE_CHAPTER_TITLE = _("More than one chapters have the same title. Please edit the chapter titles to make them unique")
ARTIFACT_SAVE_NOXHTML_ERROR = _("Modality must have some body.")
#################################
# Course Generator
#################################
NO_STANDARD_ALIGNED_ARTIFACTS = _("At present we don't have content for the selected standards. Please change the selection and try again")

#################################
# EncodedID Error
#################################
DUPLICATE_ENCODEDID = _("Duplicate entry for encodedID. Please change the encodedID and try again")
INVALID_ENCODEDID_DOMAINEID = _("Invalid domainEID or encodedID specified. Please correct and try again")

#################################
# General
#################################
GENERAL_OPERATION_FAILED = _("This operation could not be completed, please try again")

#################################
# Resource
#################################
RESOURCE_ALREADY_EXISTS = _("A resource with this name already exists. Please use a different name.")
RESOURCE_ASSOCIATION_FAILED = _("There was an error attaching this file, please try again later.")
RESOURCE_FILE_TOO_LARGE = _("Uploaded file is too large. Maximum size allowed is 25 MB")
RESOURCE_FILE_INFECTED = _("The file you are trying to upload seems to be infected.")
RESOURCE_UPLOAD_FAILED = _("Failed to upload the file. Unknown error.")
RESOURCE_SAVE_FAILED = _("Failed to create or update the resource, Unknown error.")
RESOURCE_NOT_FOUND = _("Specified resource does not exist.")

################################
# Exercise 
#################################
EXERCISE_ERROR_REPORT_REASON_EMPTY = _("Please enter the reason")
