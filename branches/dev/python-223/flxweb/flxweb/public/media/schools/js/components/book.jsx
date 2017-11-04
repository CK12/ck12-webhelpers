define((require) => {
    'use strict';
    var React = require('react');
    class Book extends React.Component {
        constructor(){
            super();
            this.state = {
                flipped:false
            }
            this.onMouseEnter = this.onMouseEnter.bind(this);
            this.onMouseLeave = this.onMouseLeave.bind(this);
        }
        onMouseEnter(){
            this.setState({'flipped':true});
        }
        onMouseLeave(){
            this.setState({'flipped':false});
        }
        render () {
            var book = this.props.bookInfo;

            return (
                <div>
                    <div className="book columns large-3 medium-4 small-6 ">
                        <div
                            className={`bookWrap ${book.description?'':'no-description'} ${this.state.flipped?'flipped':''}`}
                            onMouseEnter={this.onMouseEnter}
                            onMouseLeave={this.onMouseLeave}
                        >
                            <div className="bookCover bookface front">
                                <img src={book.cover} data-pin-nopin="true" />
                            </div>
                            <div className="bookInfo bookface back">
                                <div className="bookInfoTop">
                                    <div className="bookDescription">{book.description}</div>
                                    <div className="bookCreator">
                                        <strong>Created by: </strong><span>{book.creatorName}</span>
                                    </div>
                                </div>
                                <a id={`"lnk-book-flipside-${book.artifactID}`} className="bookLink" href={book.artifactPerma}>Open FlexBook ®</a>
                            </div>
                        </div>
                        <div className="bookTitle text-center">
                            <a id="lnk-book-title-335823" className="bookLink" href={book.artifactPerma}>{book.artifactTitle}</a>
                            <div className="bookCreator">
                                <span>{book.creatorName}</span>
                            </div>
                        </div>

                    </div>
                </div>
            );
        }
    }
    return Book;
});
