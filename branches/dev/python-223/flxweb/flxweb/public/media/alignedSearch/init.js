import { render } from 'react-dom';
import React   from 'react';


import App from './src/app/app';

import appConfig from './src/app/appConfiguration';

render(
    <App {...appConfig}/>,
    document.getElementById('ck12Go')
);
