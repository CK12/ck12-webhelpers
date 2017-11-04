from urlparse import urlparse

branches = [u'arithmetic', u'measurement', u'algebra', u'geometry', u'probability', u'analysis', u'calculus', u'earth-science', u'life-science', u'physical-science', u'biology', u'chemistry', u'physics', u'elementary-math-grade-1', u'elementary-math-grade-2', u'elementary-math-grade-3', u'elementary-math-grade-4', u'elementary-math-grade-5', u'history', u'trigonometry', u'statistics', u'engineering',u'english',u'astronomy', u'english', 'software-testing']

book_types = ['book','tebook','workbook','studyguide','labkit','quizbook']

page_types = {'student': 'student_home_page', 'teacher':'teacher_home_page', 'browse':'browse_page', 'standards':'standards_aligned_page',
              'standard':'standard_home_page', 'ngss':'next_generation_science_standards_page', 'ccss':'common_core_math_standards_page',
              'group':'group_home_page', 'group-discussions': 'group_discussions_page', 'group-resources':'group_resources_page',
              'group-settings':'group_settings_page', 'group-members':'group_members_page', 'group-assignments':'group_assignments_page',
              'group-reports':'group_reports_page' , 'assessment':'assessment_page','editor':'editor_page', 'section':'section_details_page',
              'na':'ghost_concept_details_page', 'concept':'conept_details_page', 'lmspractice':'lmspractice_page', 'saythanks':'thank_you_page',
              'theme':'theme_page'}

def get_page_type_from_url(url):
    """
    """
    url = url.strip()
    if not url:
        return
    if url in ['http://www.ck12.org/', 'https://www.ck12.org/']:
        page_type = 'ck12_home_page'
        return page_type
    page_type = 'unknown'
    book_type = ''
    obj = urlparse(url)
    query = obj.query
    tmp_params = query.split('&')
    tmp_params = filter(None, tmp_params)
    query_params = dict(filter(lambda y:len(y) == 2,map(lambda x:x.split('=', 1), tmp_params)))
    path = obj.path
    parts = path.split('/')
    parts = filter(None, parts)

    tmp_type1 = tmp_type2 = tmp_type3 = ''
    try:
        tmp_type1 = parts[0].lower()
        tmp_type2 = parts[1].lower()
        tmp_type3 = parts[2].lower()
    except:
        pass

    if page_types.has_key(tmp_type1):
        page_type = page_types[tmp_type1]
        return page_type

    if tmp_type1 == 'search':
        if query_params.get('source') == 'community':
            page_type = 'community_search_page'
        elif query_params.get('source') == 'my':
            page_type = 'my_search_page'
        else:
            page_type = 'ck12_search_page'
        return page_type
    elif tmp_type1 == 'new' and tmp_type2 == 'concept':
        page_type = 'create_new_concept_page'
    elif tmp_type1.startswith('user:') and tmp_type2 == 'section':
        page_type = 'user_section_details_page'
    elif tmp_type1.startswith('user:') and tmp_type2 == 'concept':
        page_type = 'user_concept_details_page'
    elif tmp_type1 == 'account' and tmp_type2 == 'settings':
        page_type = 'account_setting_page'
    elif tmp_type1 == 'account' and tmp_type2 == 'signin-complete':
        page_type = 'signin_complete_page'
    elif tmp_type1 == 'auth':
        if tmp_type2 == 'signup':
            if tmp_type3 == 'teacher':
                page_type = 'teacher_signup_page'
                return page_type        
            elif tmp_type3 == 'student':
                page_type = 'student_signup_page'
                return page_type        
            elif tmp_type3 == 'complete':
                page_type = 'account_created_page'
                return page_type
            else:
                page_type = 'signup_page'
                return page_type

        elif tmp_type2 == 'signin':
                page_type = 'signin_page'
                return page_type
        elif tmp_type2 == 'forgot' and tmp_type3 == 'password':
                page_type = 'forgot_password_page'
                return page_type

    if tmp_type1 == 'join' and tmp_type2 == 'group':
        page_type = 'group_join_page'
        return page_type

    if tmp_type1 == 'create' and tmp_type2 == 'exercise' and tmp_type3 == 'test':
        page_type = 'create_quiz_page'
        return page_type


    if tmp_type1 in branches or tmp_type2 in branches:
        prefix = ''
        if tmp_type1.startswith('user'):
            prefix = 'user_'
        else:
            prefix = 'ck12_'
        if prefix == 'ck12_':
            if len(parts) == 1: # Eg. http://www.ck12.org/earth-science/
                page_type = '%sbranch_details_page' % prefix
            elif len(parts) == 2: # Eg. http://www.ck12.org/earth-science/Minerals/
                page_type = '%sconcept_details_page' % prefix
            else:
                page_type = '%smodality_details_page' % prefix # Eg. http://www.ck12.org/earth-science/Minerals/lesson/Minerals/?referrer=featured_content
        else:
            if len(parts) == 2: # Eg. http://www.ck12.org/earth-science/
                page_type = '%sbranch_details_page' % prefix
            elif len(parts) == 3: # Eg. http://www.ck12.org/earth-science/Minerals/
                page_type = '%sconcept_details_page' % prefix
            else:
                page_type = '%smodality_details_page' % prefix # Eg. http://www.ck12.org/earth-science/Minerals/lesson/Minerals/
        return page_type
   
    if tmp_type2 in ['dashboard', 'groups', 'library',  'content', 'tests']:
        if tmp_type2 == 'dashboard':
            if obj.fragment == 'selfStudy':
                page_type = 'self_study_page'
                return page_type
            elif obj.fragment == 'groupActivity':
                page_type = 'group_study_page'
                return page_type
        page_type = '%s_page' % tmp_type2
        return page_type

    # Book types occurs either in first or second part of the URL
    if tmp_type1 in book_types:
        book_type = tmp_type1
    elif tmp_type2 in book_types:
        book_type = tmp_type2

    if book_type:
        if parts[-1] == 'section':
            page_type = 'invalid_book_section_details_page'
            return page_type
        if tmp_type1.startswith('user'):
            book_type_tmp = 'user_%s' % book_type
            if 'concept' in tmp_type3: # Book title contains concept
                book_type_tmp = 'user_concept_%s' % book_type
        else:
            book_type_tmp = 'ck12_%s' % book_type
            if 'concept' in tmp_type2: # Book title contains concept
                book_type_tmp = 'ck12_concept_%s' % book_type

        if 'section' in parts:
            # Eg. /book/CK-12-Algebra-I-Concepts/section/1.0/ will be book_chapter_details_page
            # /book/CK-12-Algebra-I-Concepts/section/1/ will be book_chapter_details_page
            # /book/CK-12-Algebra-I-Concepts/section/1.5/ will be book_section_details_page
            section_index = parts.index('section')
            section_no = parts[section_index + 1]
            section_parts = section_no.split('.')
            chapter_no = section_no = ''
            try:
                chapter_no = int(section_parts[0])
                section_no = int(section_parts[1])
            except:
                pass
            if section_no and section_no > 0:
                page_type = '%s_section_details_page' % book_type_tmp
            elif chapter_no:
                page_type = '%s_chapter_details_page' % book_type_tmp
            else:
                page_type = '%s_details_page' % book_type_tmp
        else:
            page_type = '%s_details_page' % book_type_tmp

    return page_type

if __name__ == '__main__':
    url = ''
    urls = [
        'http://www.ck12.org/earth-science/' ,
        'http://www.ck12.org/algebra/Order-of-Operations/' ,
        'http://www.ck12.org/algebra/Order-of-Operations/lesson/Order-of-Operations-Intermediate/' ,
        'http://www.ck12.org/book/CK-12-Algebra-I-Concepts/' ,
        'http://www.ck12.org/book/CK-12-Algebra-I-Concepts/section/1.0/' ,
        'http://www.ck12.org/book/CK-12-Algebra-I-Concepts/section/1.6/' ,
        'http://www.ck12.org/browse/' ,
        'http://www.ck12.org/my/dashboard/' ,
        'http://www.ck12.org/my/groups/' ,
        'http://www.ck12.org/my/library/' ,
        'http://www.ck12.org/my/dashboard/#selfStudy' ,
        'http://www.ck12.org/my/dashboard/#groupActivity' ,
        'http://www.ck12.org/search/?q=life&source=ck12' ,
        'http://www.ck12.org/search/?q=life&source=community' ,
        'http://www.ck12.org/search/?q=life&source=my' ,
        'https://www.ck12.org/account/settings' ,
        'https://www.ck12.org/auth/signup/teacher' ,
        'https://www.ck12.org/auth/signup/student' ,
        'https://www.ck12.org/auth/signup/complete' ,
        'https://www.ck12.org/standards/' ,
        'https://www.ck12.org/standard/' ,
        'https://www.ck12.org/ngss/' ,
        'https://www.ck12.org/ccss/' ,
        'https://www.ck12.org/group/52640' ,
        'https://www.ck12.org/group-discussions/52640' ,
        'https://www.ck12.org/group-resources/52640' ,
        'https://www.ck12.org/group-settings/52640' ,
        'https://www.ck12.org/group-members/52640' ,
        'https://www.ck12.org/group-assignments/52640' ,
        'https://www.ck12.org/group-reports/52640' ,
        'https://www.ck12.org/join/group/?accessCode=ha6df']

    urls = ['http://www.ck12.org/user%3AY21vc2J5QHRtc2FjaGFydGVyLm9yZw../book/7th-grade-NC-essential-standards/r2/section/11.3/',
            'http://www.ck12.org/book/Basic-Speller-Student-Materials/section/4.9/',
            'http://www.ck12.org/user%3AY21vc2J5QHRtc2FjaGFydGVyLm9yZw../book/CK-12-Algebra-I-Concepts/section/1.0/',
            'http://www.ck12.org/user%3AY21vc2J5QHRtc2FjaGFydGVyLm9yZw../book/CK-12-Algebra-I-Concepts/section/1.5/',
            'http://www.ck12.org/user%3AY21vc2J5QHRtc2FjaGFydGVyLm9yZw../earth-science/',
            'http://www.ck12.org/user%3AY21vc2J5QHRtc2FjaGFydGVyLm9yZw../earth-science/Minerals/',
            'http://www.ck12.org/user%3AY21vc2J5QHRtc2FjaGFydGVyLm9yZw../earth-science/Minerals/lesson/Minerals/?referrer=featured_content',
            'http://www.ck12.org/section/Integers-::of::-Grade-6-Enrichment-::of::-CK-12-Middle-School-Math-Grade-6-Teachers-Edition'
            ]

    for url in urls:        
        print '\n%s' %url
        print get_page_type_from_url(url)
