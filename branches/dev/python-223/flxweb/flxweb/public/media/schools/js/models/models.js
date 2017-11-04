define([
    'underscore',
    'backbone1x',
    'schools/services/schools.services',
    'common/utils/utils',
    'common/utils/user',
    'schools/services/schoolsADS',
    'schools/config/SchoolConfig',
    'jquery'
], function(_, Backbone, service, utils, user, schoolsADS, SchoolConfig, $){
    'use strict';
    var State, StateCollection, SchoolLocation, Book, BookCollection, School, SchoolCollection;

    // TODO : Move to utils
    var isOffline =  function(){
        return (typeof navigator.onLine != 'undefined') && !navigator.onLine;
    };

    State = Backbone.Model.extend({
        initialize: function(){
            var state = this.get('_id');
            this.set('slug', utils.slugify(state));
            this.set('name', utils.toTitleCase(state));
        }
    });
    StateCollection = Backbone.Collection.extend({
        model: State,
        sync: function(method, model, options){
            var _dfd = service.getStates(options);
            _dfd.done(function(data){
                var filteredData =  [];
                for ( var i =0; i< data.length; i++){
                        if( data[i].total > 0){
                            filteredData.push(data[i]);
                        };
                }
                options.success(filteredData);
            }).fail(function(){
                options.error(arguments);
            });
            return _dfd;
        },
        parse: function(data){
            return _.sortBy(data, function(item){
                return item._id;
            });
        }
    });
    SchoolLocation = Backbone.Model.extend({
        sync: function(method, model, options){
            var _dfd = service.getSchoolsForState(options.data);
            _dfd.done(function(data){
                options.success(data);
            }).fail(function(){
                options.error(arguments);
            });
            return _dfd;
        },
        parse: function(response){
            if (response && response.schoolArtifacts){
              // BUG 51753
              // sort the schools alphabetically. It is already being done at API layer but not taking care of  character case
                response.schoolArtifacts.sort( function(a, b){
                  if(a.schoolName.toLowerCase() > b.schoolName.toLowerCase() )
                     return 1;
                  if(a.schoolName.toLowerCase() < b.schoolName.toLowerCase() )
                     return -1;

                  return 0 ;
                })
                response.schoolArtifacts = new SchoolCollection(response.schoolArtifacts);
                return response;
            }
        }
    });
    Book = Backbone.Model.extend({});
    BookCollection = Backbone.Collection.extend({
        model: Book
    });
    School = Backbone.Model.extend({

        defaults:{
            claimStatus : '',
            claimedByCurrentUser : false,
            editMode : false,
            updateError: false,
            errorMsg : '',
            addBtnDisable : false
        },
        initialize: function(){
            var approved_books = this.get('artifacts') || [],
                book;
                approved_books.forEach (function(val){
                        if (val.cover == null){
                            val.cover =  SchoolConfig.DEFAULT_COVER_IMAGE
                        }
                })
            this.bind('change:updateError', this.updateErrorMsg, this);
            this.set('books', new BookCollection( approved_books ));
            // if (approved_books.length){
                book = approved_books[0];
                this.set('state', this.get('state'));
                this.set('stateSlug', utils.slugify(this.get('state')));
                this.set('stateName', utils.toTitleCase(this.get('state')));
                this.set('schoolID', this.get('schoolID'));
                this.set('slug', utils.slugify( this.get('schoolName')));
            // }
        },
        updateErrorMsg : function(){
            if(!this.get('updateError')){
                 this.set('errorMsg','')
            }
        },
        toggleEditMode: function () {
            this.set('editMode',!this.get('editMode'));
            if(!this.get('editMode')){
                this.set('updateError', false)
            }
        },
        fetchSchoolClaimStatus : function(){
            //  api request to check if the page is already claimed by the current user
            var self = this;

            user.getUser().done(function(res){
                if(!res.userInfoDetail.id || res.is_student()){
                    console.warn( res.is_student() ? 'user is student' : 'user not logged in')
                    return ;
                }
                var req =  {
                    memberID: res.userInfoDetail.id,
                    schoolID : self.get('schoolID')
                }

                 service.getSchoolClaimStatus(req).done( function ( data ) {
                    self.set('claimStatus',data.claimStatus)
                    self.set('claimedByCurrentUser', data.claimedByCurentUser) // TODO is ask claimedByCurrentUser

                  }).fail(function (res) {

                    console.error(res)

                  })

            })

        },
        deleteABook : function(model){
            var self = this;

             if( isOffline()){
                 self.set('errorMsg','You are disconnected, please check internet connection' )
                 self.set('updateError',true);
                 return;
            }

             user.getUser().done(function(res){
                if(res.userInfoDetail.id){
                    var params  =   SchoolConfig.stateDetailsRequestParams ;
                        params.state =  self.get('state')
                     var onCompleteData = $.param(params);
                     self.set('updateError', false);
                    //extract out the data
                    service.deleteAFlexBook({
                         artifactID : model.get('artifactID'),
                         schoolID   : self.get('schoolID')
                    }, onCompleteData).done(function(data){
                        // delete it from the local cache
                        // since the API is responding back with the remaining artifact types
                        // var existingBookList =  self.get('artifacts').filter(function(book){
                        //         return book.artifactID !=  data.artifactID  //&& book.schoolID ==  data.schoolID
                        // })
                         data.forEach (function(val){
                                if (val.cover == null){
                                    val.cover =  SchoolConfig.DEFAULT_COVER_IMAGE
                                }
                        })
                        self.set('artifacts', data)
                        self.set('books', new BookCollection(self.get('artifacts')))
                        self.set('updateError', false);
                        // TODO delete the cache from localStorage

                    }).fail(function (res) {
                        console.error(res)
                        self.set('updateError',true)
                    })
                }else{
                        self.set('errorMsg','You are not logged in')
                         self.set('updateError',true);
                }

              })


        },
        updateSchoolName: function (val,callback) {
            //1. trim the whitespaces at the ends
            //2. if the string length is > 0 , then do RegexTest then check user loggedin, then profane text and then call update
            //3. if at any place it fails, then we show an error
             var self =  this;
             val  =  val.trim();
             self.set('updateError', false);
            if( isOffline()){
                 self.set('errorMsg','You are disconnected, please check internet connection' )
                 self.set('updateError',true);
                 return;
            }
             if(val.length > 100 ){
                self.set('errorMsg','Max Character count allowed is 100')
                self.set('updateError',true);
                return ;
             }
             if(val.length>0){
                if( val == self.get('schoolName') || /^[a-zA-Z0-9-_.,&\s]+$/.test(val)){

                    user.getUser().done(function(res){
                        if(res.userInfoDetail.id){

                            service.profaneText({string:utils.b64EncodeUnicode(val)}).done(function(responseData){
                                if(responseData.isProfane){
                                    self.set('errorMsg','Profane Words are not allowed')
                                    self.set('updateError',true);
                                }else{

                                    var req =  {
                                        schoolID: self.get('schoolID'),
                                        schoolName : val
                                    };
                                   var params  =   SchoolConfig.stateDetailsRequestParams ;
                                       params.state =  self.get('state')
                                   var onCompleteData = $.param(params);
                                   service.updateSchoolName(req,onCompleteData).done(function(data){
                                        //if checks for whether the operation was successful
                                        self.set('schoolName',data.schoolName)
                                        self.set('slug', utils.slugify( self.get('schoolName')));
                                        self.set('schoolID', data.schoolID);
                                        window.history.replaceState({}, self.get('schoolName'),self.get('slug'))
                                         if(callback){
                                            callback(responseData)
                                         }
                                    }).fail(function(res){

                                        console.error(res)
                                        self.set('errorMsg',res.response.message);
                                        self.set('updateError',true);
                                         if(callback){
                                            callback(res)
                                         }
                                    })

                                }
                            }).fail(function(errorData){
                                console.error(errorData);
                                self.set('updateError',true)
                            })

                        }else{
                            self.set('errorMsg','You are not logged in')
                            self.set('updateError',true);
                        }
                    })


                }else{
                     self.set('errorMsg','School name can not have special characters except (.)(,)(-)(_)(&)')
                     self.set('updateError',true);
                }

             }else{
                     self.set('errorMsg','School name can not be empty')
                     self.set('updateError',true);
             }



        },
        saveABook: function (url, schoolName, schoolID ) {
            if(this.get('addBtnDisable')){
                this.set('errorMsg','The request to add this FlexBook has already been sent')
                this.set('updateError',true);
                return;
            }

            var regex  = /\//,
                self = this;

            if( isOffline()){
                 self.set('errorMsg','You are disconnected, please check internet connection' )
                 self.set('updateError',true);
                 return;
            }

            this.set('addBtnDisable', true);
            this.set('updateError', false);
            if(url){
                try{
                    do{
                        url =  decodeURIComponent(url);
                    }while( url.indexOf('%')!= -1)

                } catch( e ){
                    this.set('errorMsg','This is not a valid FlexBook link')
                    this.set('updateError',true);
                    this.set('addBtnDisable', false);
                    return;
                }

                //Fix For 49285, adding another check which is not a generic URL validation check but
                //specific for the flexbook urls
                // so if the urls do not have a / and a . then its not a valid url

                if( url.indexOf('/') == -1 || url.indexOf('.') == -1 ){
                    this.set('errorMsg','This is not a valid FlexBook link')
                    this.set('updateError',true);
                    this.set('addBtnDisable', false);
                    return;
                }



                var hostname  = location.hostname+ '/'; //TODO check if hostname and based on that
                if(url.indexOf(hostname) != -1 ){
                    url =  url.replace(hostname,'').replace(/https{0,1}:\/{2}|\/$|\?\S*/g,'')

                    var urlSpilt = url.split(regex)
                    urlSpilt = urlSpilt.filter(function(val){
                        return val.length >0
                    })
                    var requestObj  =  {};

                    var artifactType,
                        handle,
                        userId,
                        permaURL;


                    if(/user:/.test(url)){ // assuming that we have already decodeURIComponent

                        if( urlSpilt.length >=3){
                         //user field exists
                         userId        = urlSpilt[0].trim() ;
                         artifactType  = urlSpilt[1].trim();
                         handle        = urlSpilt[2].trim();
                         permaURL      = [artifactType, handle, userId].join('/');

                        }else{

                          this.set('errorMsg','This is not a valid FlexBook link')
                          this.set('updateError',true);
                          this.set('addBtnDisable', false);
                          return;

                        }

                    }else {

                        if( urlSpilt.length >= 2){
                              // user does not exist
                            artifactType  = urlSpilt[0].trim();
                            handle        = urlSpilt[1].trim();
                            userId        = '';
                            permaURL      = [artifactType, handle].join('/');


                        }else{
                              this.set('errorMsg','This is not a valid FlexBook link')
                              this.set('updateError',true);
                              this.set('addBtnDisable', false);
                             return;
                        }
                    }
                    requestObj = {
                            artifactType : artifactType,
                            handle: handle,
                            schoolID : this.get('schoolID'),
                            permaURL : permaURL
                    }

                    if( SchoolConfig.flexbook_artifact_type.indexOf( artifactType ) == -1 ){
                            this.set('errorMsg','Only FlexBooks, TeacherBook, Workbook, QuizBook and LabKit can be added')
                            this.set('updateError',true);
                            this.set('addBtnDisable', false);
                            return;
                    }
                    user.getUser().done(function(res){
                    schoolsADS.logADS('claim_school_add_book_complete',schoolName, schoolID);
                    // requestObj.memberID =  res.userInfoDetail.id
                    if(res.userInfoDetail.id){
                    var params  =   SchoolConfig.stateDetailsRequestParams ;
                        params.state =  self.get('state')
                     var onCompleteData = $.param(params);

                    service.addAFlexBook(requestObj, onCompleteData).done(function(res){
                        var artifacts  = res.artifacts;
                        artifacts.unshift( artifacts.pop()); // Server sends the current artifact at the end of array, For Display purposes we need to put it at the front
                        artifacts.forEach (function(val){
                            if (val.cover == null){
                                val.cover =  SchoolConfig.DEFAULT_COVER_IMAGE
                            }
                         })
                        self.set('artifacts', artifacts)
                        self.set('books', new BookCollection(self.get('artifacts')))
                        self.set('addBtnDisable', false);
                        self.set('updateError', false);

                    }).fail(function(err){
                        console.error(err)
                        var statusCode = err.responseHeader ? err.responseHeader.status :  null,
                            errorMsg ;
                        switch( statusCode ){
                            case 14016:
                                errorMsg =  'FlexBook is already present in the school';
                                break;
                            case 14015:
                                errorMsg =  'FlexBook not published yet';
                                break;
                             case 14017:
                                errorMsg =  'FlexBook link is not valid';
                                break;
                             case 14018:
                                errorMsg =  'FlexBook link does not exist';
                                break;
                        }

                        self.set('errorMsg',errorMsg);
                        self.set('addBtnDisable', false);
                        self.set('updateError',true);

                    })


                    }else{
                         self.set('errorMsg','You are not logged in');
                         self.set('addBtnDisable', false)
                         self.set('updateError',true);

                    }

                    })


                    //
                }else{
                    self.set('errorMsg','Only the FlexBooks from '+ location.hostname+' are allowed');
                    self.set('addBtnDisable', false)
                    self.set('updateError',true);
                }


            }else{
                 self.set('errorMsg','Paste the FlexBook link to add to school');
                 self.set('addBtnDisable', false);
                 self.set('updateError',true);
            }
        }


    });
    SchoolCollection = Backbone.Collection.extend({
        model: School
    });

    return {
        State: State,
        StateCollection: StateCollection,
        SchoolLocation: SchoolLocation,
        Book: Book,
        BookCollection: BookCollection,
        School: School,
        SchoolCollection: SchoolCollection
    };
});
