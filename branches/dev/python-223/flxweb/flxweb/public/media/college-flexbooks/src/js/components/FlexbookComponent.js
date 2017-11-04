import React, {Component} from 'react';
import Flexbook from './Flexbook';
import FlexbookHeader from './FlexbookHeader';

class FlexbookComponent extends Component {
    render() {
        return (
                <div className="book-container columns large-4 medium-4 small-12 left">
                    <Flexbook perma={this.props.perma} handle={this.props.handle} coverImage={this.props.coverImage} title={this.props.title} />
                    <FlexbookHeader perma={this.props.perma} handle={this.props.handle} coverImage={this.props.coverImage} title={this.props.title} />
                </div>
        );
    }
}

export default FlexbookComponent;
