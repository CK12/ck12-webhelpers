import React, {Component} from 'react';
import hatIcon from '../../images/Grad_cap.png'

class flexbookHeader extends Component {
    render() {
        return (
                <div className="flexbook-header">
                    <a href={this.props.perma} className="flexbook-level">
                        <img className="" src={hatIcon} />
                        <span>College Level</span>
                    </a>
                    <div className="flexbook-title">
                        <a href={this.props.perma}>{this.props.title}</a>
                    </div>
                </div>
        );
    }
}

export default flexbookHeader;
