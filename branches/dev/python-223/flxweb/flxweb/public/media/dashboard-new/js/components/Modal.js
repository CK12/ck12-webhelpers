import React, {Component, PropTypes} from 'react';

import { hideModal } from 'actions/modalActions';
import { renderChildren } from 'utils/react';

import styles from 'scss/components/Modal';

export default class Modal extends Component {
    constructor(props) {
        super(props);

        this.onOverlayClick = this.onOverlayClick.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    componentDidMount(){
        this.backgroundCanScroll(!!this.props.allowBackgroundScroll);
    }

    componentWillUnmount(){
        this.backgroundCanScroll(true);
    }

    backgroundCanScroll(shouldScroll = false){
        const type = shouldScroll ? 'remove' : 'add';
        document.body.classList[type]('noScroll');
    }

    onOverlayClick(){
        if(this.props.preventOverlayClick){ return; }
        this.closeModal();
    }

    closeModal(){
        this.props.dispatch(hideModal());
    }

    render() {
        const { children, hideCloseButton, className='', reset, style, maxWidth='large', ...restProps} = this.props;
        const resetStyles = reset ? styles.reset : '';
        return (
            <div className={styles.container}>
                <div onClick={this.onOverlayClick} className={`${styles.overlay} dxtrack-user-action`} data-dx-desc={"Close overlay modal"}></div>
                <div className={styles.modalContainer}>
                    <div className={`${styles.modal} ${resetStyles} ${className} ${styles[maxWidth]}`} style={style}>
                        <CloseButton onClick={this.closeModal} hideCloseButton={hideCloseButton} />
                        { renderChildren(children, {...restProps}) }
                    </div>
                </div>
            </div>
        );
    }
}

Modal.propTypes = {
    dispatch: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired,
    className: PropTypes.string
};

const CloseButton = ({onClick, hideCloseButton}) => {
    if(hideCloseButton){ return null; }
    return (
        <i onClick={onClick} className={`icon-close2 ${styles.closeButton} dxtrack-user-action`} data-dx-desc={"Close button modal"}></i>
    );
};