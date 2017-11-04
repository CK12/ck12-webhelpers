$.fn.center = function () {
    this.css("position","absolute");
    
    var checkTop = ( $('.formula').height() - this.height() ) / 2;
    var top = (checkTop > 0) ? checkTop : 0;
    
    var checkLeft = ( $('.formula').width() - this.width() ) / 2;
    var left = (checkLeft > 0) ? checkLeft : 0;
    /*console.log(this.height()); */   
    this.css("top", top + 'px');
    this.css("left", left + 'px');

    return this;
};

$.fn.caret12 = function (begin, end)
{
    if (this.length == 0) return;
    if (typeof begin == 'number')
    {
        end = (typeof end == 'number') ? end : begin;
        return this.each(function ()
        {
            if (this.setSelectionRange)
            {
                this.setSelectionRange(begin, end);
            } else if (this.createTextRange)
            {
                var range = this.createTextRange();
                range.collapse(true);
                range.moveEnd('character', end);
                range.moveStart('character', begin);
                try { range.select(); } catch (ex) { }
            }
        });
    } else
    {
    	if (document.selection && document.selection.createRange)
        {
            var range = document.selection.createRange();
            begin = 0 - range.duplicate().moveStart('character', -100000);
            end = begin + range.text.length;
        }
    	else if (this[0].setSelectionRange)
        {
            begin = this[0].selectionStart;
            end = this[0].selectionEnd;
        } 
    	console.log(1);
        return { start: begin, end: end };
    }
};

/*//Store the old val function
$.fn.custom_oldVal = $.fn.val;

//Update the val function to fire the change event where appropriate:
$.fn.val = function(value) {
    if(value == null || value == undefined){
    	console.log('change');
        return this.custom_oldVal();
    } else {
        //Only call onchange if the value has changed
        if(value == this.custom_oldVal()){
        	console.log('change');
            return this;//Return this object for chain processing
        } else {
        	console.log('change');
            return this.custom_oldVal(value).change();
            
        }
    }
    console.log('change');
};*/
