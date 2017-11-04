define((require)=>{
    'use strict';
    var React = require('react');
    var Book = require('./book');

    class School extends React.Component {
        render() {
            var books = this.props.books.map( (book) => {
                return ( <Book key={book.artifactID} bookInfo={book} /> )
            })
            return (
                <div className="school row collapse">
                    <div className="column large-12 small-12">
                        <div className="school_title row collapse">
                            <div className="show-for-small">
                                <a href={this.props.url}>{this.props.name}</a>
                            </div>
                            <div className="hide-for-small">
                                <span className="left">
                                    <a href={this.props.url}>{this.props.name}</a>
                                </span>
                                <span className="right school-link">
                                    <a href="">
                                        <span>View School</span>
                                        <span className=" icon-arrow3_right right-side"></span>
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className='row'>
                            {books}
                        </div>
                    </div>
                </div>
            );
        }
    }
    return School;
});
