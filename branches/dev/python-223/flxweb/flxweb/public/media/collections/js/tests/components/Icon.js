import React from 'react'; // eslint-disable-line no-unused-vars
import TestUtils from 'react-addons-test-utils';
import expect from 'expect';
import Icon from '../../components/common/Icon';

describe('Icon', () => {
  it('should render the icon', () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(<Icon name='bell'/>);
    const actual = renderer.getRenderOutput().props.className;
    const expected = 'icon-bell';
    expect(actual).toEqual(expected);
  });
});
