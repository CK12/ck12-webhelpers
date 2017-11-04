define((require) => {
    'use strict';
    var React = require('react');
    class StateBanner extends React.Component {
        render (){
            return (
                <div id="schoolBanner" className="district-banner smooth-text">
                    <div className="row school-banner-top-layer">
                        <div className="column large-6 small-12 school-banner-header">
                            <div className="row collapse">
                                <span>Schools</span>
                                <img
                                    className="heart-image"
                                    src="/media/common/images/heart_throb_anim.gif" />
                                <span>CK-12,</span>
                            </div>
                            <div className="row collapse">
                                and we love you too.
                            </div>
                        </div>
                    </div>
                    <div className="school-banner-bottom-layer">
                        <div className="row collapse home-image-wrapper">
                            <img
                                className="right home-image hide-for-small"
                                src="/media/schools/images/school.png" />
                            <img
                                className="home-image show-for-small"
                                src="/media/schools/images/school.png" />
                        </div>
                    </div>
                </div>
            );
        }
    }
    return StateBanner;
});
