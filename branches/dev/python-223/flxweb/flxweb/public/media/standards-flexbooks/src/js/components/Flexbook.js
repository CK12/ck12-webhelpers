import React, {Component} from 'react';

class Flexbook extends Component{
    render(){
        return (
                <div className="book-wrapper">
                    <div className="books">
                        <figure className="book">
                            <a href={this.props.perma} className="listitemimglink">
                                <ul>
                                    <li className="front">
                                        <div className="cover">
                                            <img src={this.props.coverImage} title={this.props.title} alt={this.props.title} />
                                        </div>
                                        <span className="shadow"></span>
                                    </li>
                                    <li className="pages">
                                        <div className="thin page1"></div>
                                        <div className="thin page2"></div>
                                        <div className="thin page3"></div>
                                    </li>
                                    <li className="back"></li>
                                    <span className="shadow"></span>
                                </ul>
                            </a>
                        </figure>
                    </div>
                </div>
        );
    }
}

export default Flexbook;
