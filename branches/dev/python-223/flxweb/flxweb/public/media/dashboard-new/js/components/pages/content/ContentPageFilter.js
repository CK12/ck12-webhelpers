import {Component} from 'react';

import DropDown from 'components/common/DropDown';


class ContentPageFilter extends Component{
	constructor(props,context){
		super(props,context);
		
		this.state ={
				selectorFilter : this.props.filters[0]
		};
		
		this.onChange = this.onChange.bind(this);
	}
	onChange(evt){
        const selected = find(this.props.filters, {
            id:evt.target.value
        });

        this.setState(Object.assign({}, this.state, {
        	selectorFilter: selected
        }));
	}
	render(){
		return (
				<div className={`small-12 columns`}>
				 <DropDown onChange={this.onChange} selectorFilter={selected} {...this.props} />
				</div>	
			);
	}

	
}

export default ContentPageFilter;