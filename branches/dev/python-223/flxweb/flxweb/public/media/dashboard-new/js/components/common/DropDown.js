import React , {Component} from 'react';

import {filter} from 'lodash';

import styles from 'scss/components/common/DropDown';

class DropDown extends Component{
	constructor(props){
		super(props)

		this.state={
			states:{
				"US":{
					"label":"United State",
				},
				"IN":{
					"label":"International",
				}
			},

		}
	}
	setInGroupOptions(){
		const {data} = this.props;

		let states = Object.assign({},this.state.states);

		Object.keys(states).map( key => {
			states[key].optgroups = filter(data,function(o){
				return o.countryCode === key
			})
		})

		return states;
	}
	render(){
		const {onChange,name,enable,isOptGroup,data,selected} = this.props;
		let states = this.setInGroupOptions();
		return(
				<div className={`column small-12 large-3 ${styles.dropDown}`}>
	                <select onChange={onChange} disabled={!enable} value={selected} className={`dxtrack-user-action`} data-dx-desc={`Click ${name}`}>
	                	<option value={`_`} data-id={`_`}>{name}</option>
	                	{
	                		(function(){
	                			if(isOptGroup){
			                		return Object.keys(states).map(key => {
					                     return <OptionGroup key={key} label={states[key]["label"]} options={states[key]["optgroups"]} />;
			                		})
		                		}else{
		                			return data.map(opt => {
		                                return <option key={opt.name} value={`${opt.name}`} data-id={`${opt.name}`}>{opt.longname || opt.name}</option>;
		                            })
		                		}
	                		}).call(this)
	                	}
	                </select>
	            </div>
		)
	}
}


const OptionGroup = (props) => {
	const {options , label} = props;
    return (
                <optgroup label={label}>
                	{options.map(opt => {
                        return <option key={opt.id} value={`${opt.id}`} data-id={`${opt.id}`}>{opt.longname || opt.name}</option>;
                    })}
                </optgroup>
    );
};

export default DropDown;