import React from 'react';

const noop = Function.prototype;

const validImages = ['.gif', '.jpg', '.jpeg', '.png'];

const ImageInput = (props) => {
    let { onChange=noop, accept=validImages, ...rest } = props;

    if(accept instanceof Array){ accept = accept.join(','); }

    return (
        <input type="file" title="Upload image" accept={accept} onChange={onChange} {...rest} />
    );
};

export default ImageInput;