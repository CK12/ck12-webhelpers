import React, {Component} from 'react';

import CardOverlayNoMembers from './CardOverlayNoMembers';
import CardOverlayNoAssignments from './CardOverlayNoAssignments';

export default class GroupCardContentOverlay extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showOverlay: true
        };

        this.hideOverlay = this.hideOverlay.bind(this);
    }

    getStudyGroupContent() {
        const { group: {membersCount} } = this.props;

        if(membersCount <= 1){
            return CardOverlayNoMembers;
        } else {
            return null;
        }
    }

    getClassContent() {
        const { group:{ membersCount, totalAssignmentsCount} } = this.props;

        if(membersCount <= 1){
            return CardOverlayNoMembers;
        } else if (!totalAssignmentsCount) {
            return CardOverlayNoAssignments;
        } else {
            return null;
        }
    }

    getCardContent(){
        const { group: {groupType, IS_DEFAULT} } = this.props;
        if(IS_DEFAULT){ return null; }
        if(groupType === 'study'){
            return this.getStudyGroupContent();
        } else {
            return this.getClassContent();
        }
    }


    hideOverlay(){
        this.setState(Object.assign({}, this.state, {
            showOverlay: false
        }));
    }

    render() {
        const { showOverlay } = this.state;
        const { group }       = this.props;

        const Content = this.getCardContent();

        if(!Content || !showOverlay ){ return null; }

        return (
            <Content group={group} onClose={this.hideOverlay} />
        );
    }
}