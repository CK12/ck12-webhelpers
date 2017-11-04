/**
 * Copyright 2007-2011 CK-12 Foundation
 * 
 * All rights reserved
 * 
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations.
 * 
 * This file originally written by Ravi Gidwani
 * 
 * $Id$
 */
define ('flxweb.ilowrapper',
    ['jquery','flxweb.global'],
    function($,global){
        var session_marker = ''+new Date().getTime();
        
        function onQuestionAssessed(question){
            var answer, ans_current, ans_correct, qtype, qid, qbundleid, qdifficulty, qconfidence=null, qresource=null, artifactId=null, time_spent=null;
            answer = question.get('answer');
            qtype = question.get('questionClass');
            qid = question.get('id');
            time_spent = answer.get('timeOnQuestion');
            qbundleid = question.get('bundleId');
            ans_current = answer.get('answerText');
            ans_correct = answer.get('correctAnswer');
            if (ans_current === ans_correct){
                $.flxweb.logADS('ilo',['correct','time_spent'],[1,time_spent],[artifactID, ads_userid],[qtype, qid, qdifficulty, qconfidence, qresource, context_eid, session_marker]);
            } else {
                $.flxweb.logADS('ilo',['wrong','time_spent'],[1,time_spent],[artifactID, ads_userid],[qtype, qid, qdifficulty, qconfidence, qresource, context_eid, session_marker]);
            }
        }
        
        ck12_ilo_require(['components/dispatcher'], function(dispatcher){
            //TODO: Need events for: "Skipped, Hint" 
            dispatcher.on( 'practice.question.answer.assessed' , onQuestionAssessed );
        });
        
        $(window).unload(function(){
        });
    }
);
