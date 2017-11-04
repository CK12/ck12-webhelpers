import expect from 'expect';
import {formatDate} from '../../utils/utils';

describe('utils', () => {

  it('should format date to the format [mmm d, yyyy]', () => {
    const actual = formatDate(1465902823000);
    const expected = 'Jun 14, 2016';
    expect(actual).toEqual(expected);
  });
});
