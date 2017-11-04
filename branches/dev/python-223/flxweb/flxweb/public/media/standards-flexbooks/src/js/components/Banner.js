import React, {Component} from 'react';
import ccssImage from '../../images/math-icon.png';
import ngssImage from '../../images/science-icon.png';

class Banner extends Component{
    render(){
        var imageElement, subject, headingText;
        if (this.props.standard == 'ccss') {
            subject = 'Math';
            imageElement = <img className="standards-banner-image left" src={ccssImage} />;
            headingText = 'Common Core Math FlexBooks®';
        } else {
            subject = 'Science';
            imageElement = <img className="standards-banner-image left" src={ngssImage} />;
            headingText = 'Next Generation Science FlexBooks®';
        }
        return (
                <div className="standardsFlexbooksBanner" className={this.props.standard + '-flexbooks-banner standards-flexbooks-banner'}>
                    <div className="row collapse standards-banner-wrapper">
                        {imageElement}
                        <h2><span className="standards-banner-text bold">
                            {headingText}
                        </span></h2>
                    </div>
                </div>
        );
    }
}

export default Banner;
