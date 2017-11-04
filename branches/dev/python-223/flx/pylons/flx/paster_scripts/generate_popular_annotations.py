import os
import json
import logging
import pymongo
from bson.objectid import ObjectId
import copy
from flx.lib.unicode_util import UnicodeWriter

LOG_FILENAME = "/tmp/popular_highlights.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)

# MongoDB configuration
db_hostname = 'localhost'
db_port = 27017
db_name = 'flx2'
db_username = None
db_password = None
db_replica_set = None

mdb = None


def member_annotation_weight(member_id):
    return 1


# Multi-threshold repeatedly runs otsu thresholding on data higher than the previously computed threshold.
# More are the number of cycles, higher will be the final threshold.
def multi_otsu_threshold(frequency_dict, cycles=2):
    threshold = 0
    for _ in xrange(cycles):
        data = []
        for node_id, offset_frequency in frequency_dict.items():
            data += offset_frequency
        hist_data = {}
        sum_data, total = 0, 0
        max_overlap = 0
        for d in data:
            if d > threshold:
                total += 1
                hist_data[d] = hist_data[d] + 1 if d in hist_data else 1
                sum_data += d
            max_overlap = d if d > max_overlap else max_overlap
        print "Max Overlap %d" % max_overlap
        wb, wf, sumb, var_max, threshold = 0, 0, 0, 0.0, 0
        for t in sorted(hist_data.iterkeys()):
            wb += hist_data[t]
            if wb == 0:
                continue
            wf = total - wb
            if wf == 0:
                break
            sumb += t * hist_data[t]
            meanb, meanf = float(sumb) / wb, float(sum_data-sumb) / wf
            var_between = wb * wf * (meanb - meanf)**2
            if var_between > var_max:
                threshold, var_max = t, var_between
    return threshold


# def insert_offset(node_offset_freq_dict, offset):
#     if offset in node_offset_freq_dict:
#         node_offset_freq_dict[offset] += 1
#     else:
#         node_offset_freq_dict[offset] = 1
#
#
# def calculate_position_score(node_dict):
#     node_position_score_dict = {}
#     for node_id, offset_freq_dict in node_dict.items():
#         node_position_score_dict[node_id] = []
#         max_offset = max(offset_freq_dict.iterkeys())
#         for position in xrange(max_offset+1):
#             position_score = 0
#             for offset, freq in offset_freq_dict.items():
#                 position_score += float(freq) / (abs(offset - position) + 1)
#             node_position_score_dict[node_id].append(position_score)
#     return node_position_score_dict
#
#
# def generate2():
#     """
#         Using position scoring algorithm
#     """
#     global mdb
#     mdb = get_mongo_db()
#
#     artifact_ids = [1105634, 10129, 1105649, 1105699, 1105720, 1083627, 5808, 1085003, 1105638, 12456, 1083681, 1845, 8310]
#     for aid in artifact_ids:
#         print "Aid: %d" % aid
#         annotations = list(mdb.Annotation_prod.find({'artifactID': aid, 'migrated': None}))
#         start_node_dict, end_node_dict = {}, {}
#         for an in annotations:
#             start_node_id, end_node_id = an['ranges'][0]['start'], an['ranges'][0]['end']
#             start_offset, end_offset = an['ranges'][0]['startOffset'], an['ranges'][0]['endOffset']
#             if start_node_id not in start_node_dict:
#                 start_node_dict[start_node_id] = {}
#             insert_offset(start_node_dict[start_node_id], start_offset)
#
#             if end_node_id not in end_node_dict:
#                 end_node_dict[end_node_id] = {}
#             insert_offset(end_node_dict[end_node_id], end_offset)
#
#             if start_node_id != end_node_id:
#                 if end_node_id not in start_node_dict:
#                     start_node_dict[end_node_id] = {}
#                 insert_offset(start_node_dict[end_node_id], 0)
#                 # Also add insert_offset(end_node_dict[start_node_id], (max_offset of start_node_id))..but how?
#
#         start_point_position_score = calculate_position_score(start_node_dict)
#         end_point_position_score = calculate_position_score(end_node_dict)
#
#         # Method 2 of finding annotations with top scores
#         for an in annotations:
#             start_node_id, end_node_id = an['ranges'][0]['start'], an['ranges'][0]['end']
#             start_offset, end_offset = an['ranges'][0]['startOffset'], an['ranges'][0]['endOffset']
#             an['score'] = start_point_position_score[start_node_id][start_offset] + \
#                           end_point_position_score[end_node_id][end_offset]
#
#         annotations = sorted(annotations, key=lambda a: a['score'], reverse=True)
#         node_id_set, pop_annotations = set([]), []
#         count = 0
#         for an in annotations:
#             start_node_id, end_node_id = an['ranges'][0]['start'], an['ranges'][0]['end']
#             if start_node_id == end_node_id:
#                 if start_node_id not in node_id_set:
#                     pop_annotations.append(an)
#                     node_id_set.add(start_node_id)
#                     count += 1
#             if count == 6:
#                 break
#
#         for i in xrange(6):
#             print pop_annotations[i]
#         x = raw_input()

# For visualisation purpose. Among the popular highlights, the colors purple, blue, green, yellow and red will
# depict the increasing order of popularity with purple being the lowest and red highest.
def perform_color_grouping(popular_highlights):
    popular_highlights = sorted(popular_highlights, key=lambda ph: ph['average_freq'])
    group_size = len(popular_highlights) / 5 if len(popular_highlights) >=5 else 1
    gs, group_num = 0, 1
    for ph in popular_highlights:
        ph['highlightColor'] = 'c' + str(group_num)
        gs += 1
        if gs >= group_size and group_num < 5:
            group_num += 1
            gs = 0
    return popular_highlights


def generate():
    """
        Using otsu's threshold algorithm to filter annotations with freq > threshold as popular annotations.
    """
    global mdb
    mdb = get_mongo_db()
    POPULAR_HIGHLIGHT_MIN_LENGTH, MAX_POPULAR_HIGHLIGHTS = 20, 15
    artifact_ids = [1105647, 1105634, 10129, 1105649, 1105699, 1105720, 1083627, 5808, 1085003, 1105638, 12456, 1083681,
                    1845, 8310, 1083629, 1083633, 1083817, 8310, 1105667]
    for aid in artifact_ids:
        print "Aid: %d" % aid
        annotations = list(mdb.Annotation_prod.find({'artifactID': aid, 'migrated':None}))
        node_dict = {}
        for an in annotations:
            start_node_id, end_node_id = an['ranges'][0]['start'], an['ranges'][0]['end']
            if start_node_id in node_dict:
                node_dict[start_node_id] = max(an['ranges'][0]['startOffset'], node_dict[start_node_id])
            else:
                node_dict[start_node_id] = an['ranges'][0]['startOffset']
            if end_node_id in node_dict:
                node_dict[end_node_id] = max(an['ranges'][0]['endOffset'], node_dict[end_node_id])
            else:
                node_dict[end_node_id] = an['ranges'][0]['endOffset']
        frequency_dict = {}
        for node_id in node_dict:
            frequency_dict[node_id] = [0]*(node_dict[node_id]+2)  # Last value in the list will always be zero
        for an in annotations:
            member_weight = member_annotation_weight(an['memberID'])
            start_node_id, end_node_id = an['ranges'][0]['start'], an['ranges'][0]['end']
            start_offset, end_offset = an['ranges'][0]['startOffset'], an['ranges'][0]['endOffset']
            if start_node_id == end_node_id:
                for char_pos in xrange(start_offset, end_offset+1):
                    frequency_dict[start_node_id][char_pos] += member_weight
            else:
                for char_pos in xrange(start_offset, len(frequency_dict[start_node_id])):
                    frequency_dict[start_node_id][char_pos] += member_weight
                for char_pos in xrange(0, end_offset+1):
                    frequency_dict[end_node_id][char_pos] += member_weight
        FREQ_THRESHOLD = multi_otsu_threshold(frequency_dict)
        print "Threshold: %d" % FREQ_THRESHOLD
        popular_highlights, pop_count = [], 0
        for node_id, offset_frequency in frequency_dict.items():
            start_offset, end_offset, running_length, total_freq = -1, -1, -1, 0
            for offset, freq in enumerate(offset_frequency):
                if freq > FREQ_THRESHOLD:
                    if start_offset == -1:
                        start_offset = offset
                    else:
                        end_offset = offset
                    running_length += 1
                    total_freq += freq
                else:
                    if running_length >= POPULAR_HIGHLIGHT_MIN_LENGTH:
                        popular_highlights.append({'artifactID': aid,
                                             'ranges': [{'start': node_id, 'end': node_id,
                                                        'startOffset': start_offset, 'endOffset': end_offset}],
                                             'threshold': FREQ_THRESHOLD,
                                             'average_freq': total_freq / (running_length+1)
                                             })
                        #mdb.PopularHighlight2.insert(popular_highlight)
                        pop_count += 1
                        #print "Saved PH"
                    start_offset, end_offset, running_length, total_freq = -1, -1, -1, 0
        popular_highlights = perform_color_grouping(popular_highlights)
        popular_highlights = sorted(popular_highlights, key=lambda ph: ph['average_freq'], reverse=True)

        for index, ph in enumerate(popular_highlights):
            if index + 1 > MAX_POPULAR_HIGHLIGHTS:
                break
            mdb.PopularHighlight.insert(ph)
        print "popular annotations saved: %d" % pop_count


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
            log.error("Failed mongodb connection attempt: %d" % (x+1))
            log.info("Exception: %s" % str(e), exc_info=e)
    return None

