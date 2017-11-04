"""
Script to go through the Annotation data, find buggy/split annotations and merge them.
Merge process will involve the following steps:
1) Create a merged annotation from split/divided annotations
2) Delete buggy annotations
3) Save merged annotation.

Step 1 subproblems:
-> Find list of split/continuous annotations (could be 2 or more). This list is created recursively by finding the
next annotation of the last annotations in the list.
-> Merge all continuous annotations into one.

2nd and 3rd steps should form a transaction.

***********************************************************************************************************************
Author: Rahul Nanda

Date: 9th August 2016
***********************************************************************************************************************

Some stats:
Total annotations (split/buggy) eligible for merge: 111,190
After running the script total count of annotations will reduce by ~ 59,986
"""
import os
import json
import pymongo
from bson.objectid import ObjectId
import copy
LOG_FILENAME = "/tmp/merge_annotations"
log = None

# MongoDB configuration
db_hostname = 'localhost'
db_port = 27017
db_name = 'flx2'
db_username = None
db_password = None
db_replica_set = None

mdb = None


def get_connected_annotations(connected_annotations, start_dict):
    # Search for a connected annotation to the last annotation in the list
    annotation = connected_annotations[-1]
    annotation_range = annotation["ranges"][0]
    if annotation in start_dict[annotation_range["start"]]:
        start_dict[annotation_range["start"]].remove(annotation)
    if annotation_range["end"] in start_dict:
        for a in start_dict[annotation_range["end"]]:
            a_range = a["ranges"][0]
            if annotation_range["endOffset"] == a_range["startOffset"] and \
                annotation_range["endNodePos"] == a_range["startNodePos"] and \
                annotation["highlightColor"] == a["highlightColor"] and \
                    annotation_range["endChildPath"] == a_range["startChildPath"]:
                connected_annotations.append(a)
                return get_connected_annotations(connected_annotations, start_dict)
    return connected_annotations, start_dict


def continuous_annotations(annotation_list):
    # Take a list of annotations and return a list of list of continuous annotations
    # Each list within the list could have 2 or more continuous annotations
    try:
        annotation_list = [a for a in annotation_list if a and a["annotation_type"] == "highlight"]
    except:
        #print annotation_list
        return []
    start_dict, end_dict = {}, {}
    for a in annotation_list:
        range_dict = a["ranges"][0]
        if range_dict["start"] in start_dict:
            start_dict[range_dict["start"]].append(a)
        else:
            start_dict[range_dict["start"]] = [a]
        if range_dict["end"] in end_dict:
            end_dict[range_dict["end"]].append(a)
        else:
            end_dict[range_dict["end"]] = [a]
    for k in start_dict:
        start_dict[k] = sorted(start_dict[k], key=lambda a: a["ranges"][0]["startOffset"])
    for k in end_dict:
        end_dict[k] = sorted(end_dict[k], key=lambda a: a["ranges"][0]["endOffset"])
    cont_ann = []
    for k in start_dict:
        for a in start_dict[k]:
            connected_annotations, start_dict = get_connected_annotations(connected_annotations=[a], start_dict=start_dict)
            if len(connected_annotations) > 1:
                cont_ann.append(connected_annotations)
    #print start_dict
    return cont_ann


def get_merged_annotation(annotation_list):
    # Accept a list of continuous annotations and return a merged annotation
    if not annotation_list:
        return None
    #merged_annotation = annotation_list[0]
    merged_annotation = copy.deepcopy(annotation_list[0])
    merged_annotation["quote"] = ""
    for a in annotation_list:
        merged_annotation["quote"] += a["quote"]
        print "merged:", merged_annotation["quote"]
        print "a: ", a["quote"]
    last_annotation = annotation_list[-1]
    merged_annotation["ranges"][0]["endOffset"] = last_annotation["ranges"][0]["endOffset"]
    merged_annotation["ranges"][0]["endChildPath"] = last_annotation["ranges"][0]["endChildPath"]
    merged_annotation["ranges"][0]["endNodePos"] = last_annotation["ranges"][0]["endNodePos"]
    merged_annotation["ranges"][0]["end"] = last_annotation["ranges"][0]["end"]
    merged_annotation.pop("sID")
    return merged_annotation


def merge_annotations(annotation_list):
    cont_ann = continuous_annotations(annotation_list)
    for c in cont_ann:
        merged_annotation = get_merged_annotation(c)
        print c
        print merged_annotation
        raw_input("Next")
        # Save merged Annotation
        saved = save_annotation(merged_annotation)
        if saved:
            # Delete corresponding annotations
            for ann in c:
                deleted = delete_annotation(ann)
                if not deleted:
                    log.error("Unable to delete annotation %s" % ann)


def save_annotation(annotation):
    # Save annotation
    global mdb
    for x in range(5):
        try:
            mdb.Annotation.insert(annotation)
            global saved_count
            saved_count += 1
            log.info("Saved annotation %s" % annotation)
            return True
        except Exception, e:
            log.error("Error inserting annotation %s" % str(e), exc_info=e)
            mdb = get_mongo_db()
    return False


def delete_annotation(annotation):
    # Delete annotation
    global mdb
    annotation_id = annotation["_id"]
    annotation_id = ObjectId(str(annotation_id))
    for x in range(5):
        try:
            mdb.Annotation.remove({"_id" : annotation_id})
            return True
        except Exception, e:
            log.error("Error deleting annotation %s" % str(e), exc_info=e)
            mdb = get_mongo_db()
    return False



def run():
    global mdb
    mdb = get_mongo_db()
    member_ids = mdb.Annotation.distinct('memberID')
    for mid in member_ids:
        artifact_ids = mdb.Annotation.find({'memberID': mid}).distinct('artifactID')
        print "Member ID %d" % mid
        for aid in artifact_ids:
            try:
                print "Artifact ID %d" % aid
            except:
                print "Exception on Artifact ID ", aid
            annotations = list(mdb.Annotation.find({'memberID': mid, 'artifactID': aid, 'migrated': True}))
            if len(annotations) > 1:
                merge_annotations(annotations)

    print member_ids


def get_mongo_db():
    for x in range(5):
        try:
            if db_replica_set:
                conn = pymongo.MongoReplicaSetClient(host=db_hostname, port=db_port,
                                                     replicaSet=db_replica_set,
                                                     read_preference=pymongo.read_preferences.ReadPreference.PRIMARY_PREFERRED)
            else:
                conn = pymongo.MongoClient(host=db_hostname, port=db_port)
            db = conn[db_name]
            if db_username and db_password:
                db.authenticate(db_username, db_password)
            return db
        except Exception, e:
            log.error("Failed mongodb connection attempt: %d" %(x+1))
            log.info("Exception: %s" % str(e), exc_info=e)
    return None


def test_continuous_annotations(cont_ann):
    ann_set = set()
    for clist in cont_ann:
        for a in clist:
            if a["sID"] not in ann_set:
                ann_set.add(a["sID"])
            else:
                print "Annotation Repeated!!"
                raw_input("\nk")
