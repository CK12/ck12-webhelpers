/* Copyright 2007-2013 CK-12 Foundation
 *
 * All rights reserved
 *      
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
 * implied.  See the License for the specific language governing
 * permissions and limitations.
 *
 * This file originally written by Mohit
 */


// This file will configure requirejs for the geometry-tool project. 
// It will set the common requirejs things: baseUrl, paths, shims, etc
/**
 * @fileoverview Add description about file.
 * @copyright copyright
 * @author Name of author
 * @license license
 * @version 0.0.0
 * @module require_config
 */


define(function() {

    requirejs.config({
        
        baseUrl: "js",

        shim: {
        	caret : {
        		deps:["jquery"],
        		exports : "caret"
        	},
        	
        	extensions : {
        		deps:["jquery"],
        		exports : "extensions"
        	},
        	foundation : {
        		deps:["jquery"],
        		exports : "foundation"
        	}
        }, 

        paths: {
            "jquery"            :  "../vendor/jquery/jquery",
            "extensions"        :  "../vendor/jquery/extensions",
            "caret"          	:  "../vendor/jquery/jquery.caret",
            //"mathjax"        	:  "../vendor/mathjax",
            //"tinymce"         	:  "../vendor/tinymce",
            "tools"				:  "tools",
            "util"           	:  "utils",
            "base64"			:	"../js/utils/base64_util",
            "lz-string"			:	"../js/utils/lz-string",
            "core"				:	"core",
            "tool"				:	"core/tool",
            "text"				:	"../vendor/require/text",
            "foundation"		:	"../vendor/foundation/foundation.min",
            "html2canvas"		:	"../vendor/html2canvas/html2canvas",
            "colorpicker"		:	"../vendor/colorpicker/colorpicker",
            "modernizr"			:	"../vendor/foundation/modernizr"
        },
        
        waitSeconds: 0
    });


    // NOW WE LOAD THE APP

    requirejs(
        [	"jquery",
         	"caret",
         	"foundation",
         	"extensions",
         	"util/util",
         	"base64",
         	"lz-string",
         	"core/math.equationeditor",
         	"html2canvas",
         	"colorpicker",
         	"modernizr"
        ], 

        function ($) 
        {
        	require(["core/math.matheditor"], function(mathEditor){
        		mathEditor.init({
        			"toolbar": ["fraction","radical","suffix","integral","bracket","mathFunction","symbol","logLimit","limitExp","matrix","greekSymbol","mathOperatorSymbol","shapeSymbol","operator","trigonometry"]
        			//"toolbar": ["fraction"]
        		});
        	});
        }
    );
});