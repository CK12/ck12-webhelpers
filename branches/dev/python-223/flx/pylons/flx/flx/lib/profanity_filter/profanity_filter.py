import os
import re
import itertools
import logging

import settings

alternate_character = { \
                       'a': ['@'], \
                       'b': ['I3', 'l3'], \
                       'c': ['c', 'C', '(', 'k', 'k'], \
                       'd': [], \
                       'e': ['3'], \
                       'f': ['ph'], \
                       'g': ['6'], \
                       'h': [], \
                       'i': ['l', '!', '1'], \
                       'j': [], \
                       'k': ['c', 'C', '('], \
                       'l': ['1', 'i', '!'], \
                       'm': [], \
                       'n': [], \
                       'o': ['0'], \
                       'p': [], \
                       'q': ['9'], \
                       'r': [], \
                       's': ['$', '5'], \
                       't': ['7'], \
                       'u': ['v'], \
                       'v': ['u'], \
                       'w': ['vv'], \
                       'x': [], \
                       'y': [], \
                       'z': ['2']
                      }

#for each_character in alternate_character.keys():
#    each_alternate_characters = alternate_character[each_character]
#    alternate_values_temp = []
#    for each_alternate in each_alternate_characters:
#        alternate_values = [each_alternate + '.', each_alternate + '-', each_alternate + '_']
#        alternate_values_temp.extend(alternate_values)
#    alternate_character[each_character].extend(alternate_values_temp)


class ProfanityFilter:

    def __init__(self):

        self.log = logging.getLogger(__name__)
        with open(settings.PROFANITY_FILTER_HOME + '/' + 'profanewords.csv') as fd:
            profane_words_csv = fd.read()
        with open(settings.PROFANITY_FILTER_HOME + '/' + 'safewords.csv') as fd:
            safe_words_csv = fd.read()
        self.profane_words = profane_words_csv.split(',')
        self.safe_words = safe_words_csv.split(',')
        self.combinations = []


    def generateCombinations(self):
        cache_file_location = settings.PROFANITY_FILTER_HOME + '/' + 'allprofanewords.csv'
        if os.path.exists(cache_file_location):
            with open(cache_file_location) as fd:
                combinations_csv = fd.read()
            self.combinations = combinations_csv.split(',')
        else:
            combinations = []
            fd = open(cache_file_location, 'a')
            for each_profane_word in self.profane_words:
                combinations_for_word = self.generateCombinationForWord(each_profane_word)
                combinations.append(combinations_for_word)
                fd.write(",".join(combinations_for_word))
                fd.write(",")
            self.combinations = combinations
            fd.close()
        return self.combinations


    def generateCombinationForWord(self, word):
        iterables = []
        combinations = []
        for each_char in word:
            iterables.append([each_char] + alternate_character.get(each_char, [each_char]))
        for each_combination in itertools.product(*iterables):
            combinations.append("".join(each_combination))
        return combinations


    def isProfane(self, string):
        string = ' ' + string + ' '
        combinations = self.generateCombinations()
        for each_combination in combinations:
            re.search('[ \t\n\r\f\v]+%s[ \t\n\r\f\v]+' %(each_combination), each_combination, re.I)
            #profane_re = re.compile('[ \.\t\n\r\f\v\,]+%s[ \.\t\n\r\f\v\,]+' %(each_combination), re.I)
            #if profane_re.search(string):
            #    return True
        return False


    def isProfaneBasic(self, string):
        string = string.strip()
        
        #First remove all the safe words(Complete match) from the input string 
        pattern = re.compile(r"\b%s\b" % re.sub(r"[ .\t\n\r\f\v,]+", "" ,"|".join(self.safe_words)), re.IGNORECASE)
        string = pattern.sub('',  string)

        if not len(string):
            #Only safe words present in string
            return False, None

        new_string = "";
        for each_part in string.split(" "):
            #if empty part 
            if not each_part:
                continue
            
            new_string += ' %s ' % each_part
            #part don't have non-alpha characters
            if each_part.isalpha():
                continue
            only_alphabets = re.sub(r"[^a-zA-Z]", "", each_part)
            new_string += only_alphabets

        string = new_string

        string = ' ' + string + ' '
        for each_profane_word in self.profane_words:
            profane_re = re.compile('[ .\t\n\r\f\v,]+%s[ .\t\n\r\f\v,]+' %(each_profane_word), re.I)
            if profane_re.search(string):
                self.log.info('Found profane word: [%s] in the input string' %(each_profane_word))
                return True, each_profane_word
        return False, None
