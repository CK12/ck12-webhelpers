import React from 'react';
import ReactDOM from 'react-dom';
import Ck12PracticeWidget from './js/practiceWidget';
import styles from './css/styles.css';

let practiceWidgetRenderer = {
    render (elementID, iframeURL, settings) {
        ReactDOM.render(
            <Ck12PracticeWidget
            	iframeURL={iframeURL}
                onMinimize={settings.onMinimize}
            	onMaximize={settings.onMaximize}
            	onNormalize={settings.onNormalize}
            />,
            document.getElementById(elementID) );
    }
};

if (window){
    window.practiceWidgetRenderer = practiceWidgetRenderer;
}

export default practiceWidgetRenderer;
