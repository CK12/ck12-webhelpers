import React from 'react';
import { hasError } from 'utils/forms';

import styles from 'scss/components/common/forms/FormError';

const FormError = (props) => {
    const errorClass = hasError(props) ? styles.error : 'hide';
    const errorMessage = props.error || '';

    return (
        <div className={errorClass}>
            {errorMessage}
        </div>
    );
};

export default FormError;