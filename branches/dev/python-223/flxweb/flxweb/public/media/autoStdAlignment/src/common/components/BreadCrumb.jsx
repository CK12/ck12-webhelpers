/**
* BreadCrumb implementation for React
* props:
* 1.   breadcrumbConfig : Array
*           { text: 'String', clickCb: 'Function'}
*
* 2.  separator : String
*          Separator to be implemented in breadcrumbs
* 3.
*
*/

import React, { Component } from 'react';

class BreadCrumb extends Component {

  render() {
    const {
          breadcrumbConfig,
          separator,
          breadCrumbContainerStyle,
          breadCrumbContainerClass,
          breadCrumbChildStyle,
          breadCrumbChildClass
        } = this.props;

    const breadCrumbChildren  =  breadcrumbConfig
                                  .map((val, key)=>{
                                        const clickCb = val.clickCb;
                                        if( clickCb ){
                                          return  <span key={key} onClick={clickCb} style={breadCrumbChildStyle} >
                                                    <a className={breadCrumbChildClass}>{val.text}</a>
                                                  </span>
                                        }
                                        return <span key={key} style={breadCrumbChildStyle} className={breadCrumbChildClass}>
                                                  {val.text}
                                               </span>
                                   })
                                   .reduce(( accum, elem)=>{
                                        return accum === null ? [elem] : [...accum, ` ${separator} `, elem]
                                    }, null)

    return (
          <div style={breadCrumbContainerStyle} className={breadCrumbContainerClass}>
              {breadCrumbChildren}
          </div>
        )
  }
}

export default BreadCrumb;

BreadCrumb.defaultProps = {
  breadcrumbConfig : {},
  separator : '/',
  breadCrumbContainerStyle : {},
  breadCrumbContainerClass : '',
  breadCrumbChildStyle : {},
  breadCrumbChildClass : ''
};
