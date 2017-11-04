import React from 'react';

const Radio = (props) => {
    const { value, field, className='', ...restProps } = props;

    try {
        validateProps(props);
    } catch(e){
        console.error(e);
        return null;
    }

    const checked = field.value == value;

    return (
        // Order matters when putting in these properties
        <input className={className} type='radio'
            // Put in any properties that aren't in field
            {...restProps}
            // Spread field object in
            {...field}
            value={value}
            checked={checked}
        />
    );
};

function validateProps(props){
    const { field } = props;

    if(!field){
        throw new Error('Field prop is required.');
    }
}

export default Radio;