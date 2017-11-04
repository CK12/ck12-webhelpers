import React from 'react'; // eslint-disable-line no-unused-vars
import BookCover from '../../components/BookCover';
import {mount} from 'enzyme';
import {expect} from 'chai';

describe ('<BookCover />', () => {

  const wrapper = mount( <BookCover /> );
  const wrapper2 = mount ( <BookCover coverImage='img.png' bookTitle='FooBar' />);

  it('should have three pages', () => {
    expect(wrapper.find('.pages .thin')).to.have.length(3);
  });

  it('utilizes coverImage prop', () => {
    const images = wrapper2.find('img');
    expect(images).to.have.length(1);
    expect(images.get(0).getAttribute('src')).to.equal('img.png');
  });

  it('utilizes bookTitle prop', () => {
    const images = wrapper2.find('img');
    expect(images).to.have.length(1);
    expect(images.get(0).getAttribute('alt')).to.equal('FooBar');
    expect(images.get(0).getAttribute('title')).to.equal('FooBar');
  });
});
