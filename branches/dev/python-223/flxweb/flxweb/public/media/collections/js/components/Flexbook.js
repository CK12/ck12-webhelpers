import React, {Component} from 'react'; // eslint-disable-line no-unused-vars

class FlexBook extends Component {
    
    constructor(props) {
        super(props);
    }

    render()
    {
        var Tebooks = false, Workbooks = false, Quizbooks = false;
        var isTeacher = this.props.isTeacher
        for (var key in this.props.extendedArtifacts)
        {
            if (key == 'tebook' || key == 'workbook' || (typeof isTeacher !== 'undefined' && isTeacher && key == 'quizbook'))
            {
                const artifact = this.props.extendedArtifacts[key].map((book) => {
                        return (
                            <span key={book.artifactID}>
                                <a href={book.perma} title={book.title} className="book-title">
                                {key == 'tebook' && 
                                'Teacher Edition'}
                                {key == 'workbook' && 
                                'Workbook'}
                                {key == 'quizbook' && 
                                'Quizzes And Tests'}</a>
                            </span>
                        );
                    });
                if (key == 'tebook') {Tebooks = artifact}
                if (key == 'workbook') {Workbooks = artifact}
                if (key == 'quizbook') {Quizbooks = artifact}    
            }
        }

        return (
          	<div className="small-12 large-6 columns left browsetitles" data-mshs="both" data-level="basic" data-language="ENG">
                <div className="books-wrapper">
                    <div className="left books">
                        <figure className="book">
                            <a href={this.props.perma} title={this.props.title}>
                                <ul>
                                    <li className="front">
                                        <div className="cover">
                                            <img src={this.props.coverImage} title={this.props.title} alt={this.props.title}/>
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
                    <div className="left browse-title" style={{marginLeft:"0px"}}>
                        <h2>
                            <a href={this.props.perma} title={this.props.title} className="book-title">{this.props.title}</a>
                        </h2>
                        <div className="extendedartifacts">          
                            {Tebooks &&
                                Tebooks
                            }
                            {Workbooks &&
                                Workbooks
                            }
                            {Quizbooks &&
                                Quizbooks
                            }
    	                </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default FlexBook