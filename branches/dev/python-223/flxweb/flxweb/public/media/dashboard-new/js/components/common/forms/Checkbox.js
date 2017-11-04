import React from 'react';
import { includes } from 'lodash';

const noop = Function.prototype;

function onChange(props){
    return () => {
        const { field, value } = props;
        const index = field.value.indexOf(value);

        // Add to field values
        if (index < 0) {
            field.onChange(field.value.concat(value));

        // Remove from field values
        } else {
            const copy = field.value.slice();
            copy.splice(index, 1);
            field.onChange(copy);
        }
    };
}

const Checkbox = (props) => {
    const { value, field, ...restProps } = props;

    try{
        validateProps(props);
    } catch(e){
        console.error(e);
        return null;
    }

    const checked = includes(field.value, value);
    return (
        // Order matters when putting in these properties
        <input type='checkbox'
            // Put in any properties that aren't in field
            {...restProps}
            // Spread field object in
            {...field}

            onChange={onChange(props)}

            // onBlur sets the field.value to false for some reason... set as noop
            onBlur={noop}

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

export default Checkbox;