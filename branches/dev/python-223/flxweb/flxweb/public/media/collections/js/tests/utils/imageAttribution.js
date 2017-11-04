import fs from 'fs';
import path from 'path';
import {expect} from 'chai';
import {
  extractImageAttributions,
  isNonCK12EditorImage
} from '../../utils/imageAttribution';

const attributionTestContent = fs.readFileSync(path.join(__dirname,'../testdata/contentXhtml/imageAttribution.xhtml'));

describe('imageAttribution.isNonCK12EditorImage', ()=> {
  it('is a function', () => {
    expect(isNonCK12EditorImage).to.be.a.function;
  });
  it('returns true for image with realm user:jaguarnac', () => {
    let result = isNonCK12EditorImage('/flx/show/THUMB_POSTCARD/image/user%3Ajaguarnac/32-1469144168-38-15-practice_image.png');
    expect(result).to.be.true;
  });
  it('returns false for image with realm user:ck12editor', () => {
    let result = isNonCK12EditorImage('/flx/show/THUMB_POSTCARD/image/user%3Ack12editor/32-1469144168-38-15-practice_image.png');
    expect(result).to.be.false;
  });
  it('returns false for image with no realm', () => {
    let result = isNonCK12EditorImage('/flx/show/THUMB_POSTCARD/image/32-1469144168-38-15-practice_image.png');
    expect(result).to.be.false;
  });
});

describe('imageAttribution.extractImageAttributions', () => {
  it ('is a function', () => {
    expect(extractImageAttributions).to.be.a.function;
  });

  it('should correctly extract attrubutions from content', ()=> {
    let attributions = extractImageAttributions(attributionTestContent);
    expect(attributions.length).to.equal(2);
    let a1 = attributions[0];
    let a2 = attributions[1];
    expect(a1.author).to.equal('test author');
    expect(a1.url).to.equal('http://www.ck12.org');
    expect(a2.author).to.equal('test author');
  });

});
