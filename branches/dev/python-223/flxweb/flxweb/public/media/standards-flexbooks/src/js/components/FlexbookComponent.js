import React, {Component} from 'react';
import Flexbook from './Flexbook';
import FlexbookHeader from './FlexbookHeader';

class FlexbookComponent extends Component {
    render(){
        let props = this.props;
        let {columnSize} = props;
        if (!columnSize) {
            columnSize = 4;
        }
        return (
            <div className={`book-container columns large-${columnSize} medium-${columnSize} small-12 left`}>
                <Flexbook perma={props.perma} handle={props.handle} coverImage={props.coverImage} title={props.title} />
                <FlexbookHeader perma={props.perma} handle={props.handle} coverImage={props.coverImage} title={props.title} />
            </div>
        );
    }
}

export default FlexbookComponent;
