/**
 * Copyright 2007-2013 CK-12 Foundation
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
define([
    'jquery',
    'backbone',
    'react',
    'react-dom',
    'embed/components/embed'
],
function ($, Backbone, React, ReactDom, EmbedView){
    'use strict';

    function Embedder() {

        this.render = function(props){
            if (!props){
                props = {};
            }
            ReactDom.render(
                React.createElement(EmbedView,props),
                document.getElementById('embed_container')
            );
        };
        this.init = function(){
            var that = this;
            $.ajax({
                url:'https://www.ck12.org/flx/get/perma/book/ck-12-biology',
                dataType: 'json'
            })
            .done( function(data) {
                console.log(data);
                var fetchedBook = data.response.book;
                that.render({
                    book: fetchedBook
                });
            });
            this.render();
        };
    }

    return Embedder;
});
