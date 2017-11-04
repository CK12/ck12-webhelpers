import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import FlexbookRenderer from './js/components/FlexbookRenderer';
import Banner from './js/components/Banner';
var standard;

class CollegFlexbooks extends Component {
    render() {
        return (
                <div className="row collapse">
                    <Banner standard={standard} />
                    <FlexbookRenderer standard={standard} />
                </div>
        );
    }
};

const init = (config)=>{
    if (window.location.href.indexOf('ccss') !== -1) {
        standard = 'ccss';
    } else {
        standard = 'ngss';
    }
    ReactDOM.render(<CollegFlexbooks />, config.elm);
};

module.exports = {
    init
};
