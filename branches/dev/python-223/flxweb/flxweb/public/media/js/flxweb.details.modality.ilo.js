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
 * This file originally written by Nachiket Karve
 *
 * $Id$
 */
define('flxweb.details.modality.ilo', ['jquery', 'flxweb.modality_views', 'underscore', 'backbone',
        'flxweb.global'
    ],
    function ($, mv) {
        'use strict';

        var ILOModalityDetailsView = mv.ModalityDetailsView.extend({
            'session_marker': null,
            'on_question_assessed': function (question) {
                var answer, ans_current, ans_correct, qtype, qid, qbundleid, qdifficulty, qconfidence = null,
                    qresource = null,
                    artifactid = null,
                    time_spent = null,
                    context_eid = null;
                answer = question.get('answer');
                qtype = question.get('questionClass');
                qid = question.get('id');
                time_spent = answer.get('timeOnQuestion');
                qbundleid = question.get('bundleId');
                ans_current = answer.get('answerText');
                ans_correct = answer.get('correctAnswer');
                context_eid = this.domain.encodedID;
                artifactid = this.artifact.get('artifactID');


                var dexterPayload = {
                  artifactID   : artifactid,
                  questionType : qtype,
                  qid          : qid,
                  time_spent   : time_spent,
                  context_eid  : context_eid,
                  session_marker : this.session_marker
                };


                if (ans_current === ans_correct) {
                  /*
                    $.flxweb.logADS('ilo', ['correct', 'time_spent'], [1, time_spent], [artifactid, window.ads_userid], 
                      [qtype, qid, qdifficulty, qconfidence, qresource, context_eid, this.session_marker]);
                      */
                    dexterjs.logEvent([
                        { 
                          eventType: "FBS_ILO_CORRECT",
                          payload: dexterPayload                 
                        }, { 
                          eventType: "FBS_ILO_TIMESPENT",
                          payload: dexterPayload
                        }
                    ]);


                } else {
                  /*
                    $.flxweb.logADS('ilo', ['wrong', 'time_spent'], [1, time_spent], [artifactid, window.ads_userid], [qtype, qid, qdifficulty, qconfidence, qresource, context_eid, this.session_marker]);
                    */
                    dexterjs.logEvent([
                        { 
                          eventType: "FBS_ILO_WRONG",
                          payload: dexterPayload                 
                        }, { 
                          eventType: "FBS_ILO_TIMESPENT",
                          payload: dexterPayload
                        }
                    ]);
                }
            },
            'initialize': function (options) {
                var self = this;
                ILOModalityDetailsView.__super__.initialize.call(this, options);
                this.session_marker = '' + new Date().getTime();
                ck12_ilo_require(['components/dispatcher'], function (dispatcher) {
                    //TODO: Need events for: "Skipped, Hint" 
                    dispatcher.on('practice.question.answer.assessed', function (answer) {
                        self.on_question_assessed(answer);
                    });
                });
            }
        });
        $(document).ready(function () {
            new ILOModalityDetailsView(window.js_modality_data);
        });
    }
);
