define( [] , function(){

	var SchoolCopyEvents =  function(){
            var _isCopySupported = document.execCommand && document.execCommand('copy');
            var _copyEventHandlerRef =  null;
            var _selectedRef =  null; 
            var _isAppInitiatedCopy =  false;

            var isCopySupported =  function(){
            	_isCopySupported =  document.execCommand && document.execCommand('copy');
                return _isCopySupported;
            };

            var addCopyEventListener =  function ( text, cb , errorCb ){

                var addCopyEventHandler  = function(e){

                    _selectedRef =  window.getSelection().toString();

                    if( _isAppInitiatedCopy ){

                        _isAppInitiatedCopy =  false;
                        _setToClipboard( e, text, cb);

                    }else{

                        if ( !_selectedRef ){
                             
                             _setToClipboard( e, text, cb);

                         }else{
                               console.log('something is already in selection')

                               if(_selectedRef.replace(/\s/g,'') == text.replace(/\s/g,'')){
                               		cb ? cb(): null;
                               }else{
                               		errorCb ? errorCb() : null;
                               }
                         }
                    }
                };

                if( !_copyEventHandlerRef ){

                    _copyEventHandlerRef =  addCopyEventHandler;
                    document.addEventListener('copy', addCopyEventHandler, false);

                }else{
                    console.log('Event Listener is already attached')
                }                
                return addCopyEventHandler;

            };

            var _setToClipboard =  function( e, text, cb ){

                   e.preventDefault();
                   if(e.clipboardData && e.clipboardData.setData ){
                         e.clipboardData.setData('text/plain',text);
                         cb?cb():null;
                   } else if ( window.clipboardData && window.clipboardData.setData ){
                         e.returnValue  =  false;
                         window.clipboardData.setData('Text',text);
                         cb?cb():null;
                   } else{
                        console.info('copy feature is not supported in this browser');
                   }

            };

            var triggerCopyEvent =  function (cb){
                
                _isAppInitiatedCopy =  _isCopySupported;

                    if(document.execCommand('copy')){
                    		cb ? cb() : null;
                    }else{
                        console.info('copy not supported in this browser, try selecting the text');                     
                    }                
            };

            var removeCopyEventListener =  function( cb ){
            	if( _copyEventHandlerRef != null){
            		document.removeEventListener('copy',_copyEventHandlerRef,false);
                	_copyEventHandlerRef =  null;
            	}else{
            		console.debug('_copyEventHandlerRef is already null')
            	}
               
            };

            return {
                addCopyEventListener : addCopyEventListener,
                removeCopyEventListener : removeCopyEventListener,
                triggerCopyEvent : triggerCopyEvent,
                isCopySupported : isCopySupported
            }

        }

	if( !SchoolCopyEvents.instance ){
		SchoolCopyEvents.instance = new SchoolCopyEvents();
	}

	return SchoolCopyEvents.instance;
	
})