import os
import glob
import codecs
from BeautifulSoup import BeautifulSoup, Tag
from urllib import quote

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.metrics.pairwise import linear_kernel
from sklearn.externals import joblib

from remoteapi import RemoteAPI
from flx.lib import helpers as h
from unicode_util import UnicodeWriter

payload_dir = '/opt/concept_lessons_5/'
payload_files = payload_dir + '/' + '*.txt'
api_server_url = 'http://gamma.ck12.org'
api_end_point = 'flx/get/info/'
taxonomy_api_server_url = 'http://gamma.ck12.org'
taxonomy_api_end_point = 'taxonomy/get/info/concept/'
fbs_server_url = 'http://www.ck12.org'
htmlpath = '/tmp/related.html'
csv_path = '/tmp/related_concepts.csv'
branch_dict = {'bio': 'biology',
               'phy': 'physics',
               'che': 'chemistry',
               'psc': 'physical-science',
               'lsc': 'life-science',
               'esc': 'earth-science'}
concept_info_dict = {}

def run(data_set):
    data_set_len = len(data_set)
    print 'Size of data set: [%s]' %(data_set_len)

    vectorizer = CountVectorizer(stop_words='english')
    trainVectorizerArray = vectorizer.fit_transform(data_set).toarray()

    transformer = TfidfTransformer()

    tfidf =  transformer.fit_transform(trainVectorizerArray).toarray()
    print 'TF-IFD Matrix'
    print tfidf
    print '-'*100
    similarArtifacts = {}
    print 'Done generating TFIDF matrix'
    #joblib.dump(tfidf, 'my_model.pkl', compress=9)


    for i in range(data_set_len):
        print 'Processing concept: [%s] [%d] of [%d]' %(file_paths[i], i, data_set_len)
        cosine_similarities = linear_kernel(tfidf[i:i+1], tfidf).flatten()
        #print 'Cosine Similarities'
        #print cosine_similarities
        #print '-'*100

        related_content_indices = cosine_similarities.argsort()[-31:]
        #print 'Related Content Indices'
        #print related_content_indices
        #print '-'*100


        #print 'Cosine Distance between similar documents'
        #cosine_distances = cosine_similarities[related_content_indices]
        #print cosine_distances
        #print '-'*100

        #print 'Path to related content'
        filename = os.path.basename(file_paths[related_content_indices[-1]])
        encodedID = ".".join(filename.split('_')[1].split('.')[:-1])
        #artifactID = filename.split('.')[0]
        similarArtifacts[encodedID] = []
        for each_related_content in related_content_indices[-31:-1]:
            print file_paths[each_related_content]
            filename = os.path.basename(file_paths[each_related_content])
            #relatedEncodedID = filename.split('.')[0]
            relatedEncodedID = ".".join(filename.split('_')[1].split('.')[:-1])
            relatedEncodedIDDict = {'relatedArtifact': relatedEncodedID, 'similarity': cosine_similarities[each_related_content]}
            similarArtifacts[encodedID].append(relatedEncodedIDDict)

    return similarArtifacts

def generate_html(similarArtifacts):
    soup = BeautifulSoup()
    html = Tag(soup, "html")
    head = Tag(soup, "head"); meta = Tag(soup, "meta"); meta['charset'] = "UTF-8"; head.append(meta); html.append(head)
    table = Tag(soup, "table")
    table['border'] = 1
    tr = Tag(soup, "tr")
    soup.append(html)
    html.append(table)
    table.append(tr)
    headers = ['Content', 'Related Concepts']
    csv_headers = ['Concept EID', 'Concept', 'Related Concept EID', 'Related Concept', 'Similarity']
    for each_header in headers:
        th = Tag(soup, "th")
        tr.append(th)
        th.append(each_header)

    fd = open(csv_path, 'w')
    csv_writer = UnicodeWriter(fd)
    csv_writer.writerow(csv_headers)

    for each_artifact in similarArtifacts.keys():
        tr_artifact = Tag(soup, "tr")
        table.append(tr_artifact)
        td_artifact = Tag(soup, "td")
        td_related_artifact = Tag(soup, "td")
        url, artifact_title, artifact_branch = get_concept_info(each_artifact)
        artifact_anchor = get_anchor_tag(soup, url, artifact_title, artifact_branch)
        count = 0
        for each_related_artifact in reversed(similarArtifacts[each_artifact]):
            csv_row = [each_artifact]
            csv_row.append(artifact_title)
            #if count >= 5:
            #    continue
            related_artifact_id = each_related_artifact['relatedArtifact']
            csv_row.append(related_artifact_id)
            similarity_measure = '(Similarity Measure: %s)' %(str("%.2f" %(each_related_artifact['similarity'])))
            url, related_artifact_title, related_artifact_branch = get_concept_info(related_artifact_id)
            csv_row.append(related_artifact_title)
            csv_row.append(str("%.4f" %(each_related_artifact['similarity'])))
            csv_writer.writerow(csv_row)
            if artifact_title == related_artifact_title:
                continue
            empty_p = Tag(soup, "p")
            cross_branch= False
            if artifact_branch != related_artifact_branch:
                cross_branch=True
            anchor = get_anchor_tag(soup, url, related_artifact_title, related_artifact_branch, cross_branch=cross_branch)
            td_related_artifact.append(anchor)
            td_related_artifact.append(similarity_measure)
            td_related_artifact.append(empty_p)
            count += 1
        td_artifact.append(artifact_anchor)
        tr_artifact.append(td_artifact)
        tr_artifact.append(td_related_artifact)
    fd.close()
    return soup.prettify()

def get_anchor_tag(soup, url, artifact_title, artifact_branch, cross_branch=False):
    anchor = Tag(soup, "a")
    anchor['href'] = url
    if cross_branch:
        anchor['class'] = 'same-branch'
    anchor.append(artifact_title + " (%s)" %(artifact_branch.title()))
    return anchor

def get_concept_info(encodedID):
    global api_end_point
    global api_server_url

    if encodedID in concept_info_dict:
        return concept_info_dict[encodedID]

    remoteAPI = RemoteAPI()
    api = taxonomy_api_end_point + str(encodedID)
    response = remoteAPI._makeCall(taxonomy_api_server_url, api, 30)
    concept_title  = response['response']['name']
    concept_handle  = response['response']['handle']
    concept_handle = quote(h.safe_encode(concept_handle))
    branch_handle  = response['response']['branch']['handle']
    branch_handle = quote(h.safe_encode(branch_handle))
    url = fbs_server_url + '/' + branch_handle + '/' + concept_handle
    concept_info = url, concept_title, concept_handle
    concept_info_dict[encodedID] = concept_info
    return concept_info

def get_content_info(artifactID):
    global api_end_point
    global api_server_url

    remoteAPI = RemoteAPI()
    api = api_end_point + str(artifactID)
    response = remoteAPI._makeCall(api_server_url, api, 30)
    artifact_title  = response['response']['artifact']['title']
    artifact_perma = response['response']['artifact']['perma']
    artifact_perma = quote(h.safe_encode(artifact_perma))
    domain_handle = response['response']['artifact']['domain']['handle']
    domain = response['response']['artifact']['domain']['branch'].lower()
    branch_handle = branch_dict[domain]
    url = api_server_url + '/' + branch_handle + '/' + domain_handle + artifact_perma
    return url, artifact_title, branch_handle

if __name__ == '__main__':
    data_set = []
    file_paths = glob.glob(payload_files)

    for each_file in file_paths:
        with open(each_file) as fd:
            content = fd.read()
        data_set.append(content)

    similarArtifacts = run(data_set)
    print 'Done with the machine learning part'
    print len(similarArtifacts.keys())
    print similarArtifacts
    html = generate_html(similarArtifacts)
    html = html.decode('utf-8')
    with codecs.open(htmlpath , 'w', encoding='utf-8') as fd:
        fd.write(html)
