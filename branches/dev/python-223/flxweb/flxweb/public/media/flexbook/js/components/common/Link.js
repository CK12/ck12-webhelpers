import React from 'react';
import Radium from 'radium';

const Link = ({style, href, disabled, children, onClick,title,target,className}) =>
  disabled?
  <span>{children}</span>:
    <a
      title={title}
      onClick={onClick}
      style={[styles,style]}
      href={href}
      target={target}
      className={className}>{children}
    </a>;
const styles = {
  color: '#00aba4',
  ':hover': {
    textDecoration: 'none'
  }
};

export default Radium(Link);
