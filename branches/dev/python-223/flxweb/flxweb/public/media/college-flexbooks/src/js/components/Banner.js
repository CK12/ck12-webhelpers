import React, {Component} from 'react';
import CKUImage from '../../images/WORDS_college.png';

class Banner extends Component{
    render(){
        return (
                <div className="collegeFlexbooksBanner" className="college-flexbooks-banner">
                    <div className="row collapse college-banner-wrapper text-center">
                        <img className="college-banner-image" src={CKUImage} />
                        <div className="college-banner-right-content large-12 text-center">
                            <div className="college-banner-text bold">
                                <span>CK-12 now offers </span>
                                <span className="free-digital-text">free digital </span>
                                <span>college FlexBooks&reg;.</span>
                            </div>
                        </div>
                    </div>
                </div>
        );
    }
}

export default Banner;
