import React from 'react';
import Radium from 'radium';
import Link from './common/Link';

const BackToTop = () =>
<div
	className='backtotop'
	style = {styles.backTop}> Back to the <Link href="#" title ="Back to the top page">
	top of the page ↑
</Link></div>
;


const styles = {
  backTop:{
    textAlign: 'right',
    padding: '30px 0px 5px 0px',
    width: '100%',
    '@media screen and (min-width:768px) and (max-width:1023px)':{
    	paddingBottom: '50px'
    }
  }
};

export default Radium(BackToTop);
