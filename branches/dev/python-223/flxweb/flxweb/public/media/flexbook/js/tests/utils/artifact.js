import {expect} from 'chai';
import {processSectionContent} from '../../utils/artifact';
import fs from 'fs';
import path from 'path';

var sectionContent = fs.readFileSync(path.join(__dirname,'../testdata/contentXhtml/sectionContent.xhtml'));
var lessonContentWithConceptMarkup = fs.readFileSync(path.join(__dirname,'../testdata/contentXhtml/lessonContent-withConceptDiv.xhtml'));
var lessonContentWithoutConceptMarkup = fs.readFileSync(path.join(__dirname,'../testdata/contentXhtml/lessonContent-noConceptDiv.xhtml'));
var largeContent = fs.readFileSync(path.join(__dirname,'../testdata/contentXhtml/largeContent.xhtml'));

describe('artifactUtils.processsectionContent', () => {

  it('is a function', ()=> {
    expect(processSectionContent).to.be.a.function;
  });

  it ('returns object with expected properties', ()=>{
    let processedContent = processSectionContent('');
    let expectedContent = {
      objectives: '',
      conceptContent: '',
      vocabulary: ''
    };
    expect(processedContent).to.deep.equal(expectedContent);
  });

  it ('correctly processes section content', () => {
    let processedContent = processSectionContent(sectionContent);
    let conceptContent = processedContent.conceptContent;

    expect(processedContent.objectives).to.equal('');
    expect(processedContent.vocabulary).to.equal('');
    expect(conceptContent).to.equal(`<h2 id="x-ck12-V2hvIFNwZWFrcyBNYXRoLCBBbnl3YXk_">
      this is a section
    </h2>
    <p id="x-ck12-ZjE3YWVjYmI2Yzc0NDkxNjYxZGVmN2M0MTM3YmJmNTM.-opy">
      It has content...
    </p>`);

  });

  it('correctly processes lesson content that does not have concept content container', ()=>{
    let processedContent = processSectionContent(lessonContentWithoutConceptMarkup);
    let expectedContent = {
      objectives: '<p id=\"x-ck12-OGVkNDkyMWFlMTQ5MTQ5ZTkyM2MzOGJkNDU5MTZmYzM.-wcp\">\n        These are lesson objectives\n      </p>',
      conceptContent: '<h2>This is lesson content.</h2>\n    <p>\n      But it\'s not wrapped in a div.\n    </p>',
      vocabulary: '<p>This is lesson vocabulary.<p/>'
    };
    expect(processedContent).to.deep.equal(expectedContent);
  });

  it('correctly processes lesson content that has concept content container', ()=> {
    let processedContent = processSectionContent(lessonContentWithConceptMarkup);
    let expectedContent = {
      objectives: '<p id=\"x-ck12-OGVkNDkyMWFlMTQ5MTQ5ZTkyM2MzOGJkNDU5MTZmYzM.-wcp\">\n        These are lesson objectives\n      </p>',
      conceptContent: '<h2>This is lesson content.</h2>\n    <p>\n      And it\'s wrapped in a div.\n    </p>',
      vocabulary: '<p>This is lesson vocabulary.<p/>'
    };
    expect(processedContent).to.deep.equal(expectedContent);
  });

  it ('should be able to quickly process large content', (done)=> {
    let start = new Date(), end;
    setTimeout(()=> {
      if ( (end-start) < 5){
        done();
      } else {
        done(`took too long to process content (${end-start}ms)`);
      }
    }, 5);
    processSectionContent(largeContent);
    end = new Date();

  });


});
