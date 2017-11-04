import React, {Component} from 'react';

class flexbookHeader extends Component {
    render() {
        return (
                <div className="flexbook-header text-center">
                    <div className="flexbook-title">
                        <a href={this.props.perma}>{this.props.title}</a>
                    </div>
                </div>
        );
    }
}

export default flexbookHeader;
