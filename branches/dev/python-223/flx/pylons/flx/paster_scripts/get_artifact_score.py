from flx.model import api
from flx.lib.unicode_util import UnicodeWriter


def calculate_l_dl_score_2(likes, dislikes, feedback_cap):
    if likes == dislikes:
        l_dl_score = 0
    elif likes + dislikes <= 10:
        l_dl_score = likes - dislikes
    elif dislikes == 0:
        l_dl_score = min((likes/feedback_cap)*4,  4)
    elif likes == 0:
        l_dl_score = -min((likes/feedback_cap)*4,  4)
    else:
        l_dl_score = min( pow( (likes/dislikes), (likes-dislikes)/abs(likes-dislikes) ), 4) * (likes-dislikes)/abs(likes-dislikes)
    return l_dl_score

def calculate_l_dl_score(likes, dislikes, feedback_cap):

    if likes == 0:
        likes = 0.1
    if dislikes == 0:
        dislikes = 0.1

    total_feedback = likes + dislikes

    if likes == dislikes:
        l_dl_score = 0
    elif total_feedback <= 10 and total_feedback >= feedback_cap:
        l_dl_score = min(likes - dislikes, 4)
    else:
        l_dl_score = min( pow( (likes/dislikes), (likes-dislikes)/abs(likes-dislikes) ), 4) * (likes-dislikes)/abs(likes-dislikes)
        l_dl_score = l_dl_score * min( (total_feedback)/feedback_cap, 1)
    return l_dl_score


def run():
    ck12_editor = api.getMembers(idList=[3])
    ck12_artifacts = api.getArtifactsByOwner(ck12_editor[0])

    low_feedback_cap = 1
    high_feedback_cap = 50
    l_score_cap = 20
    low_l_dl_weight = 0.4
    high_l_dl_weight = 0.3
    l_weight = 0.3

    output_file = open('/tmp/artifact_scores.csv', 'w')
    writer = UnicodeWriter(output_file)
    headers = ['ArtifactID', 'Artifact Title', 'Artiact Link', 'Likes', 'Dislikes', 'Low L-DL Score', 'High H-DL Score', 'L Score', 'Final Score']
    writer.writerow(headers)


    for each_artifact in ck12_artifacts:
        if each_artifact.type.name == 'concept':
            continue
        artifact_feedback = each_artifact.getFeedbacks()
        if 'voting' not in artifact_feedback:
            continue
        artifact_voting = artifact_feedback['voting']
        likes = artifact_voting.get('like', 0)
        dislikes = artifact_voting.get('dislike', 0)
        if likes <= 1 and dislikes <= 1:
            print 'ArifactID: [%s] has lessn than 1 like and less than 1 dislike. Skipping...' %(each_artifact.id)
            continue

        artifact_id = each_artifact.id
        artifact_title = each_artifact.getTitle()
        artifact_link = 'http://www.ck12.org' + each_artifact.getPerma()

        likes = float(likes)
        dislikes = float(dislikes)

        #Calculate Low L-DL score
        low_l_dl_score = calculate_l_dl_score(likes, dislikes, low_feedback_cap)
        print 'ArtifactID: [%s] -> Likes: [%d], Dislikes: [%d], Low L-DL score: [%0.2f]' %(each_artifact.id, likes, dislikes, low_l_dl_score)

        #Calculate L score
        l_score = min((likes/l_score_cap)*4,  4)
        print 'ArtifactID: [%s] -> Likes: [%d], Dislikes: [%d], L score: [%0.2f]' %(each_artifact.id, likes, dislikes, l_score)

        #Star candidate score
        #Calculate High L-DL score
        high_l_dl_score = calculate_l_dl_score(likes, dislikes, high_feedback_cap)
        print 'ArtifactID: [%s] -> Likes: [%d], Dislikes: [%d], High L-DL score: [%0.2f]' %(each_artifact.id, likes, dislikes, high_l_dl_score)

        final_score = (low_l_dl_score*low_l_dl_weight + l_score*l_weight + high_l_dl_score*high_l_dl_weight)*25
        print 'Final Score: [%0.2f]' %(final_score)

        writer.writerow([ artifact_id, artifact_title, artifact_link, likes, dislikes, low_l_dl_score, high_l_dl_score, l_score, final_score ])

    print 'Done!'
    output_file.close()
