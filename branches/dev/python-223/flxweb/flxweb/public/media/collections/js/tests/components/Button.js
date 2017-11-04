import React from 'react'; // eslint-disable-line no-unused-vars
import TestUtils from 'react-addons-test-utils';
import expect from 'expect';
import Button from '../../components/common/Button';

describe('Button', () => {
  it('should be a button', () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(<Button/>);
    const actual = renderer.getRenderOutput().type;
    const expected = 'button';
    expect(actual).toEqual(expected);
  });
});
