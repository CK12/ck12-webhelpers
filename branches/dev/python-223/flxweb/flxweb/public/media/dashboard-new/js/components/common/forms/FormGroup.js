import React from 'react';
import styles from 'scss/components/common/forms/FormGroup';
import { hasError } from 'utils/forms';

function validateProps(props){
    const { children} = props;

    if(!children){
        throw new Error('FormGroup must act as a wrapper.');
    }
}

const FormGroup = (props) => {

    try{
        validateProps(props);
    } catch(e) {
        console.error(e);
        return null;
    }

    const { children, element, className } = props;

    const _el        = element || 'div';
    const _className = className || '';

    const errorClass = hasError(props) ?  styles.sectionError : '';

    return (
        <_el className={`${_className} ${errorClass}`}>
            {children}
        </_el>
    );
};

export default FormGroup;