import React, {Component} from 'react';
import { connect } from 'react-redux';

import QueueableComponent from 'components/base/QueueableComponent';
import styles from 'scss/components/GroupsFilter';
import * as groupsActions from 'actions/groupsActions';
import convertGroupsFilterToString from 'utils/groupFilter';

import {isEqual} from 'lodash';

class Filter extends Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    isChecked() {
        return this.props.filter.checked;
    }

    onClick() {
        const {onFilterClick, filter} = this.props;

        onFilterClick({
            [filter.id]: {
                checked: !filter.checked
            }
        });
    }

    render() {
        const { filter } = this.props;
        let checked = this.isChecked() ? styles.checked : '';

        return (
            <span onClick={this.onClick} className={`column shrink ${styles.filter} ${checked} dxtrack-user-action`} data-dx-desc={`Toggle group filter - ${filter.title}`}>
                {filter.title}
            </span>
        );
    }
}

class GroupsFilter extends QueueableComponent{
    constructor(props, context){
        super(props, context);
    }
    componentDidUpdate(prevProps, prevState){
        if(!isEqual(prevProps.groupsFilter, this.props.groupsFilter)){
            this.queue.clear();
            this.queue.add(this.props.fetchGroups(convertGroupsFilterToString(this.props.groupsFilter)));
        }
    }
    componentWillUnmount(){
        super.componentWillUnmount();
    }
    render(){
        const { groupsFilter, onFilterClick } = this.props;
        return (
            <div className="column">
                <div className="row">
                    <span className={`column shrink ${styles.label}`}>Show:</span>
                        <div className={`column small-12 medium-10 ${styles.filterContainer}`}>
                            <div className={`row`}>
                            { Object.keys(groupsFilter).map( key =>
                                <Filter key={key} filter={groupsFilter[key]} onFilterClick={onFilterClick} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) =>{
    return {
        fetchGroups: (groupsFilter) =>{
            return groupsActions.fetchGroupsWithFilter(groupsFilter, dispatch);
        }
    }
}
export default connect(null, mapDispatchToProps)(GroupsFilter);
