import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import FlexbookRenderer from './js/components/FlexbookRenderer';
import Banner from './js/components/Banner';

class CollegFlexbooks extends Component {
    render() {
        return (
                <div className="row collapse">
                    <Banner />
                    <FlexbookRenderer />
                </div>
        );
    }
};

const init = (config)=>{
    ReactDOM.render(<CollegFlexbooks />, config.elm);
};

module.exports = {
    init
};
