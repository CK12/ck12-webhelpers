define( (require, exports, module) => {
    'use strict';

    var React = require('react');
    var EmbedHeader = require('./embedHeader');

    class Book extends React.Component {
        render (){
            var chapterContainerStyles = {
                padding: 10
            };
            var book = this.props.book;
            var {revisions:[{children:children}]} = book;
            var bookChildren = children.map( (child, idx) => {
                return (
                    <ChapterInfoRow key={child.artifactID} chapter={child} index={idx + 1} />
                );
            });
            return (
                <div>
                    <BookInfoRow book={book} />
                    <div className="container" style={chapterContainerStyles}>
                    {bookChildren}
                    </div>
                </div>
            );
        }
    }

    class ChapterInfoRow extends React.Component {
        render(){
            var chapter = this.props.chapter;

            return (
                <div className="clearfix">
                    <div className="text-right large-1 small-1 column" >
                        {this.props.index}
                    </div>
                    <div className="column large-11, small-11">
                        <div><strong>{chapter.title}</strong></div>
                    </div>
                </div>
            );
        }
    }

    class BookInfoRow extends React.Component {
        render (){
            var {coverImage, title, gradeGrid, summary, creator} = this.props.book;
            var bookHeaderStyles = {
                marginTop: 25
            };
            var grades = gradeGrid.map( (grade) => grade[1] ).join(', ');
            return (
                <div className="container clearfix" style={bookHeaderStyles}>
                    <div className='columns small-3 large-3' >
                        <BookCover src={coverImage} />
                    </div>
                    <div className='columns small-9 large-9' >
                        <h2>{title}</h2>
                        <div>{summary}</div>
                        <div><strong>Created By: </strong>{creator}</div>
                        <div><strong>Grades: </strong>{grades}</div>
                    </div>
                </div>
            );
        }
    }

    class BookCover extends React.Component {
        render () {
            var src = this.props.src;
            if (src.indexOf('THUMB_POSTCARD') === -1){
                src = src.replace(/cover%20page/, 'THUMB_POSTCARD/cover%20page');
            }
            return (<img src={src} />);
        }
    }


    class BookEmbedView extends React.Component {

        render () {

            var header = <EmbedHeader />,
                content = null;
            console.log(this);
            if (!this.props.book){
                content = (<div> Fetching Book... </div>);
            } else {
                content = (<div><Book book={this.props.book} /></div>);
            }
            return (
                <div>
                {header}
                    <div>
                        {content}
                    </div>
                </div>

            );
        }
    }
    module.exports = BookEmbedView;
});
