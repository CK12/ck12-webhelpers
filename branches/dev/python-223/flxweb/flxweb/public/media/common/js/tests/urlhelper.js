/* global define, describe, it*/
define(['common/utils/url'], function(URLHelper){
    describe('URLHelper', function() {
        it('URLHelper exists', function(){
            URLHelper.should.exist;
        });

        it('new URLHelper() picks window location', function(){
            (new URLHelper()).url().should.equal(window.location.href);
        });

        it('Constructs relative urls', function(){
            var targetUrl = window.location.href.substr( 0, window.location.href.lastIndexOf('/') + 1 ) + 'test/asdf';
            (new URLHelper('test/asdf')).url().should.equal(targetUrl);
        });

        it('Constructs root-relative urls', function(){
            var targetUrl = window.location.origin + '/test/asdf';
            (new URLHelper('/test/asdf')).url().should.equal(targetUrl);
        });

        it('Constructs protocol-agnostic urls', function(){
            var targetUrl = window.location.protocol + '//test/asdf';
            (new URLHelper('//test/asdf')).url().should.equal(targetUrl);
        });

        it('Constructs absolute urls', function(){
            var targetUrl = 'https://www.ck12.org/';
            (new URLHelper('https://www.ck12.org')).url().should.equal(targetUrl);
            (new URLHelper('https://www.ck12.org/')).url().should.equal(targetUrl);
        });

        it('Extracts query parameters', function(){
            var url = 'http://example.com/?a=20&b=30&c=hello&d=%20apple',
                dict = {
                    a:'20',
                    b:'30',
                    c:'hello',
                    d:' apple'
                },
                helper = new URLHelper(url);

            helper.search_params.should.exist;
            helper.search_params.should.deep.equal(dict);
        });

        it('Extracts hash parameters', function(){
            var url = 'http://example.com/#a=20&b=30&c=hello&d=%20apple',
                dict = {
                    a:'20',
                    b:'30',
                    c:'hello',
                    d:' apple'
                },
                helper = new URLHelper(url);

            helper.hash_params.should.exist;
            helper.hash_params.should.deep.equal(dict);
        });

        it('Constructs query parameters', function(){
            var url = 'http://example.com/?a=20&b=30&c=hello&d=%20apple',
                dict = {
                    a:'20',
                    b:'30',
                    c:'hello',
                    d:' apple'
                },
                helper = new URLHelper('http://example.com');

            helper.updateSearchParams(dict);
            helper.url().should.equal(url);
        });

        it('Constructs hash parameters', function(){
            var url = 'http://example.com/#a=20&b=30&c=hello&d=%20apple',
                dict = {
                    a:'20',
                    b:'30',
                    c:'hello',
                    d:' apple'
                },
                helper = new URLHelper('http://example.com');

            helper.updateHashParams(dict);
            helper.url().should.equal(url);
        });

        // it('Constructs app urls', function(){
        //     var url = 'appurl:///test';
        //     (new URLHelper(url)).url().should.equal(url);
        // })
    });
});
