define((require) => {
    'use strict';
    var React = require('react');
    var School = require('./school');

    class SchoolList extends React.Component {
        render() {
            var schools = this.props.schools.map( (school) => {
                return (<School key={school.id} name={school.name} url={school.url} books={school.books} />);
            });

            return (
                <div className='content-wrap row'>
                    <div>
                        {schools}
                    </div>
                </div>
            );
        }
    }

    return SchoolList;
});
