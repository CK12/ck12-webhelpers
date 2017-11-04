import React, {Component} from 'react';
import FlexbookComponent from './FlexbookComponent';

class FlexbookRenderer extends Component{
    constructor() {
        super();
        this.state = {
            ccssBooks:
            [
                {
                    'perma': 'https://www.ck12.org/book/CK-12-Interactive-Algebra-I-for-CCSS/', 
                    'handle': 'CK-12-Interactive-Algebra-I-for-CCSS', 
                    'coverImage': 'https://dr282zn36sxxg.cloudfront.net/datastreams/f-d%3A157b418e973bc60392be1653918de72e7a7e565bce54e6d2f25d9b87%2BCOVER_PAGE_THUMB_LARGE_TINY%2BCOVER_PAGE_THUMB_LARGE_TINY.1', 
                    'title': 'CK-12 Interactive Algebra I for CCSS'
                }, 
                {
                    'perma': 'https://www.ck12.org/tebook/CK-12-Interactive-Algebra-I-For-CCSS-Teachers-Guide/', 
                    'handle': 'CK-12-Interactive-Algebra-I-For-CCSS-Teachers-Guide', 
                    'coverImage': 'https://dr282zn36sxxg.cloudfront.net/datastreams/f-d%3A44fe6a47ff0b2705bfa72f870ff865805b79b670258d4ea739c21c61%2BCOVER_PAGE_THUMB_LARGE_TINY%2BCOVER_PAGE_THUMB_LARGE_TINY.1', 
                    'title': 'CK-12 Interactive Algebra I for CCSS - Teacher\'s Guide'
                }, 
                {
                    'perma':  'https://www.ck12.org/book/CK-12-Interactive-Geometry-for-CCSS/', 
                    'handle': 'CK-12-Interactive-Geometry-for-CCSS', 
                    'coverImage': 'https://dr282zn36sxxg.cloudfront.net/datastreams/f-d%3Af34775c2bb25c32b2c41fdbfb6e9a7e2a61fe0c27f4f8a0ffa4fd04a%2BCOVER_PAGE_THUMB_LARGE_TINY%2BCOVER_PAGE_THUMB_LARGE_TINY.1',
                    'title': 'CK-12 Interactive Geometry for CCSS'
                },
                {
                    'perma': 'https://www.ck12.org/tebook/CK-12-Interactive-Geometry-for-CCSS-Teachers-Guide/', 
                    'handle': 'CK-12-Interactive-Geometry-for-CCSS-Teachers-Guide', 
                    'coverImage': 'https://dr282zn36sxxg.cloudfront.net/datastreams/f-d%3A0ced8057d79cc63b75b6e3d971e5d3e59a10c531d5562d235478dbf2%2BCOVER_PAGE_THUMB_LARGE_TINY%2BCOVER_PAGE_THUMB_LARGE_TINY.1', 
                    'title': 'CK-12 Interactive Geometry for CCSS - Teacher\'s Guide'
                }
            ],
            ngssBooks:
            [
                {
                    'perma': '/book/CBSE_Biology_Book_Class_9', 
                    'handle': 'CBSE_Biology_Book_Class_9', 
                    'coverImage': '/flx/show/THUMB_LARGE/cover%20page/3-1456868276-48-66-india_biology_grade-09.png', 
                    'title': 'CK-12 CBSE Biology Class 9'
                }, 
                {
                    'perma': '/book/CBSE_Biology_Book_Class_X', 
                    'handle': 'CBSE_Biology_Book_Class_X', 
                    'coverImage': '/flx/show/THUMB_LARGE/cover%20page/3-1456868319-19-11-india_biology_grade-10.png', 
                    'title': 'CK-12 CBSE Biology Class 10'
                }, 
                {
                    'perma': '/book/CBSE_Biology_Book_Class_XI', 
                    'handle': 'CBSE_Biology_Book_Class_XI', 
                    'coverImage': '/flx/show/THUMB_LARGE/cover%20page/3-1456869023-11-1-india_biology_grade-11.png', 
                    'title': 'CK-12 CBSE Biology Class 11'
                },
                {
                    'perma': '/book/CBSE-Maths-Book-Class-9', 
                    'handle': 'CBSE-Maths-Book-Class-9', 
                    'coverImage': '/flx/show/THUMB_LARGE/cover%20page/3-1456868665-68-81-india_math_09.png', 
                    'title': 'CK-12 CBSE Maths Class 9'
                }, 
                {
                    'perma': '/book/CBSE-Maths-Book-Class-10', 
                    'handle': 'CBSE-Maths-Book-Class-10', 
                    'coverImage': '/flx/show/THUMB_LARGE/cover%20page/3-1456868233-42-23-india_math_10.png', 
                    'title': 'CK-12 CBSE Maths Class 10'
                }, 
                {
                    'perma': '/book/CBSE_Maths_Book_Class_11', 
                    'handle': 'CBSE_Maths_Book_Class_11', 
                    'coverImage': '/flx/show/THUMB_LARGE/cover%20page/3-1456868823-04-79-india_math_11.png', 
                    'title': 'CK-12 CBSE Maths Class 11'
                }
            ]
        };
    }
    render () {
        var books, columnSize = 4;
        if (this.props.standard == 'ccss') {
            books = this.state.ccssBooks;
            columnSize = 6;
        } else {
            books = this.state.ngssBooks;
        }
        let [studentBooks, teBooks] = books.reduce((m,book)=>{
            if (book.perma.indexOf('tebook')!==-1){
                m[1].push(book);
            } else {
                m[0].push(book);
            }
            return m;
        },[[],[]]);
        
        return(
            <div id="flexbooksContainer" className="flexbooks-container">
                <div className="row collapse">
                    {
                        studentBooks.map(function(item, index) {
                            return (<FlexbookComponent 
                                perma={item.perma} 
                                handle={item.handle} 
                                coverImage={item.coverImage} 
                                title={item.title} 
                                key={index}
                                columnSize={columnSize}
                            />);
                        })
                    }
                </div>
                <div class="row collapse">
                    <div className="large-12 tgHeader"><h3>Teacher's Guides</h3></div>
                    <div className="row collapse">
                    {
                        teBooks.map(function(item, index) {
                            return (<FlexbookComponent 
                                perma={item.perma} 
                                handle={item.handle} 
                                coverImage={item.coverImage} 
                                title={item.title} 
                                key={index}
                                columnSize={columnSize}
                            />);
                        })
                    }
                </div>
                </div>
            </div>
        );
    }
}

export default FlexbookRenderer;
