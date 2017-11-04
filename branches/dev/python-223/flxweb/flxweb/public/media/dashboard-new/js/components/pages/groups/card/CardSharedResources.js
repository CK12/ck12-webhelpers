import React, {Component, PropTypes} from 'react';
import { map, get, uniq } from 'lodash';
import routes from 'routes';
import QueueableComponent from 'components/base/QueueableComponent';

import styles from 'scss/components/SharedResources';
import { replacePlaceholder } from 'utils/routes';

const ALL = 'all';

function getActivityType(activity) {
    return get(activity, 'artifact.type.name');
}

function sortResourcesByType(activities) {
    return activities.reduce((obj, next)=>{
        const type = getActivityType(next);

        if(obj.hasOwnProperty(type)){
            obj[type].push(next);
        } else {
            obj[type] = [next];
        }

        return obj;
    }, {});
}

export default class CardSharedResource extends QueueableComponent {
    constructor(props) {
        super(props);

        this.state = {
            currentResourceType: ALL,
            resourceTypes: uniq(map(this.props.activities, getActivityType)),
            sortedResources: sortResourcesByType(this.props.activities)
        };

        this.onChange = this.onChange.bind(this);
    }

    onChange(evt){
        this.setState(Object.assign({}, this.state, {
            currentResourceType: evt.target.value
        }));
    }

    render() {
        const { currentResourceType, resourceTypes, sortedResources } = this.state;
        const { group,total ,groupId } = this.props;
        return (
            <div className={`row align-stretch align-center small-up-1`}>
                <div className={styles.contentBackground}></div>
                <div className={`column`}>
                    <div className={`row ${styles.header} text-center`}>
                        <div className={`column`}>
                            <ResourceTypeSelector onChange={this.onChange} resourceTypes={resourceTypes} currentResourceType={currentResourceType} group={group} />
                        </div>
                    </div>
                    <div className={`row ${styles.content} text-left`}>
                        <div className={`column ${styles.contentItems}`}>
                            <ResourceTypeRows groupId = {groupId} total ={total} sortedResources={sortedResources} currentResourceType={currentResourceType} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const ResourceTypeSelector = ({onChange, resourceTypes, currentResourceType, group}) => {
    const ID = `shared-${group.id}`;

    return (
        <div className="row align-center">
            <div className="column small-11">
                <span className={styles.headerTitle}>Shared Resources</span>

                <div className={`row align-middle`}>
                    <div className={`column shrink`}>
                        <label htmlFor={ID}>Sort by:</label>
                    </div>
                    <div className={`column`}>
                        <select id={ID} className={styles.selector} onChange={onChange} value={currentResourceType}>
                            <option value={ALL}>All</option>;
                            { resourceTypes.map(resourceType => {
                                return <option key={resourceType} value={resourceType}>{resourceType}</option>;
                            }) }
                        </select>
                    </div>
                </div>

            </div>
        </div>
    );
};

const ResourceTypeRows = ({sortedResources, currentResourceType,total,groupId}) => {
    const rows = currentResourceType === ALL ? Object.keys(sortedResources) : [currentResourceType];
    const isSeeAll = total>10?true:false;
    return (
        <div className={`row`}>
            <div className={`column`}>

                { rows.map((row)=>{
                    return <ResourceTypeRow key={row} rowName={row} content={sortedResources[row]} />;
                })}
            
                	< ShowAllShared total={total} groupId = {groupId}/>
                
               
            </div>
        </div>
    );
};

const ResourceTypeRow = ({rowName, content}) => {
    return (
        <div className={`row`}>
            <div className={`column`}>
                <span className={styles.title}>{rowName}</span>
                { content.map((item)=>{
                    return <ResourceItem key={item.id} item={item} />;
                })}
            </div>
        </div>
    );
};

const ResourceItem = ({item}) => {
    let title = get(item, 'activityData.title'),
        url   = get(item, 'activityData.url');

    return (
        <a href={url} className={styles.item}>{title}</a>
    );
};
const ShowAllShared=({total,groupId})=>{
	const url = replacePlaceholder(routes.group.resources, groupId)
	if(total>10){
		return(
				<a href={url} className = {styles.item}>See All </a>
		)
	}else{
		return null
	}
	
}