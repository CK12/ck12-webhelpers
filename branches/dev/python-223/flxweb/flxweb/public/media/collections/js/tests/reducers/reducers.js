import expect from 'expect';
import {location} from '../../reducers/location';
import {SET_LOCATION} from '../../actions/actionTypes';

describe('reducers', () => {
  it('should set location', () => {
    const action = {
      type: SET_LOCATION,
      payload: {
        location: 'www.ck12.org'
      }
    };
    const actual = location( '', action);
    const expected = 'www.ck12.org';
    expect(actual).toEqual(expected);
  });
});
