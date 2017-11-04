import React, {Component} from 'react';
import { Promise } from 'bluebird';

import { Loader } from 'components';
import convertGroupsFilterToString from 'utils/groupFilter';

export default class GroupPagination extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isPaginating: false
        };

        this.setPaginationState = this.setPaginationState.bind(this);
        this.handlePagination = this.handlePagination.bind(this);
        this.hasActiveFilter = this.hasActiveFilter.bind(this);
    }

    setPaginationState(state=false){
        return new Promise((resolve)=>{
            this.setState(
                Object.assign({}, this.state, { isPaginating: state }),
                resolve
            );
        });
    }

    handlePagination(){
        const { paginateGroups, groupsFilter } = this.props;
        const newPageNum = this.getPageNum() + 1;

        const turnOff = ()=>this.setPaginationState();

        return this.setPaginationState(true)
            .then(()=>{
                const filters = {...groupsFilter, pageNum: newPageNum};
                return paginateGroups(convertGroupsFilterToString(filters))
                    .then(turnOff);
            })
            .catch(turnOff);
    }

    getPageNum(){
        const { groups: { offset, limit }} = this.props;
        return Math.floor( (offset + limit) / limit );
    }

    hasActiveFilter(){
        const { groupsFilter } = this.props;
        return Object.keys(groupsFilter).some((item)=> groupsFilter[item].checked);
    }

    render() {
        const { groups: { limit, offset, total } } = this.props;

        if( (limit + offset) >= total || !this.hasActiveFilter() ){ return null; }

        const disabled = this.state.isPaginating;

        return (
            <div className={`column small-12 text-center`}>
                <button className={`button large pagination-button dxtrack-user-action`} onClick={this.handlePagination} disabled={disabled} data-dx-desc={"Paginate more groups"}>
                    Show more groups {disabled ? <Loader /> : null}
                </button>
            </div>
        );
    }
}
