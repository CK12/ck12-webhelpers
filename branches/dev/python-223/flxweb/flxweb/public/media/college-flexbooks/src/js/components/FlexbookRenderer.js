
import React, {Component} from 'react';
import FlexbookComponent from './FlexbookComponent';

class FlexbookRenderer extends Component{
    constructor() {
        super();
        this.state = {
            books:
            [
                {
                    'title': 'CK-12 Elementary and Intermediate College Algebra',
                    'handle': 'CK-12-Elementary-and-Intermediate-College-Algebra',
                    'coverImage': 'https://dr282zn36sxxg.cloudfront.net/datastreams/f-d%3Ac5d88396a9e91805505b5e34ebdbbeb2e381694262dcac2cc9e1c13c%2BCOVER_PAGE_THUMB_LARGE_TINY%2BCOVER_PAGE_THUMB_LARGE_TINY.1',
                    'perma': 'https://www.ck12.org/book/CK-12-Elementary-and-Intermediate-College-Algebra'
                },
                {
                    'title': 'CK-12 College Precalculus',
                    'handle': 'CK-12-College-Precalculus',
                    'coverImage': 'https://dr282zn36sxxg.cloudfront.net/datastreams/f-d%3Aa826b1fa8e69c8a5ce572f5c170e58a79cd6e19ef036f574615ba086%2BCOVER_PAGE_THUMB_LARGE_TINY%2BCOVER_PAGE_THUMB_LARGE_TINY.1',
                    'perma': 'https://www.ck12.org/book/CK-12-College-Precalculus'
                },
                {
                    'title': 'CK-12 College Human Biology',
                    'handle': 'CK-12-College-Human-Biology',
                    'coverImage': 'https://dr282zn36sxxg.cloudfront.net/datastreams/f-d%3A65e8bfe2471ad52deaee7f8ec032d907bf38f861e75ab449f27d0d7b%2BCOVER_PAGE_THUMB_LARGE_TINY%2BCOVER_PAGE_THUMB_LARGE_TINY.1',
                    'perma': 'https://www.ck12.org/book/CK-12-College-Human-Biology'
                },
                {
                    'title': 'Origins and the Search for Life in the Universe',
                    'handle': 'Origins-and-the-Search-for-Life-in-the-Universe',
                    'coverImage': 'https://dr282zn36sxxg.cloudfront.net/datastreams/f-d%3A10e1bfb69662e02457fa34f0e33779d583eb752fbd5e21812c5d6b3d%2BCOVER_PAGE_THUMB_LARGE_TINY%2BCOVER_PAGE_THUMB_LARGE_TINY.1',
                    'perma': 'https://www.ck12.org/user%3Azgvicmeuzmlzy2hlckbnbwfpbc5jb20./book/Origins-and-the-Search-for-Life-in-the-Universe/'
                }
            ]
        };
    }
    render () {
        return(
            <div id="flexbooksContainer" className="flexbooks-container">
                <div className="row collapse">
                    {
                        this.state.books.map(function(item, index) {
                            return (<FlexbookComponent perma={item.perma} handle={item.handle} coverImage={item.coverImage} title={item.title} key={index} />);
                        })
                    }
                </div>
            </div>
        );
    }
}

export default FlexbookRenderer;
