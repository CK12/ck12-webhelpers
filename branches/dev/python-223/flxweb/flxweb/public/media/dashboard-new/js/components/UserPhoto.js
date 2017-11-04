import React, {Component, PropTypes} from 'react';
import { ImageInput } from 'components/common/forms';
import Loader from 'components/Loader';

import styles from 'scss/components/UserPhoto';

import * as userActions from 'actions/userActions';

const noop = Function.prototype;

export default class UserPhoto extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: false
        };

        this.handleImageChange = this.handleImageChange.bind(this);
        this.getProfilePicture = this.getProfilePicture.bind(this);

        this.showLoader = this.showLoader.bind(this);
        this.hideLoader = this.hideLoader.bind(this);

        this.onClick = this.onClick.bind(this);
    }

    validateImageSize(file){
        return file.size < 2097152; // 2MB
    }

    validateImageType(file){
        return /\.(jpg|jpeg|png|gif)$/i.test(file.name);
    }

    validateImage(file){
        if(!(file instanceof File)){ throw new Error('Not a valid file.'); }
        if(!this.validateImageSize(file)){ throw new Error('Image size must be below 2MBs.'); }
        if(!this.validateImageType(file)){ throw new Error('Image must be a gif, jpg, jpeg, or png.'); }
    }

    setLoader(state=true){
        this.setState(Object.assign({}, this.state, {
            isLoading: state
        }));
    }

    showLoader(){ this.setLoader(); }
    hideLoader(){ this.setLoader(false); }

    handleImageChange(e) {
        e.preventDefault();

        const { dispatch, callback=noop } = this.props;

        let file = e.target.files[0],
            formData;

        try {
            this.validateImage(file);
        } catch(e) {
            return console.error(e);
        }

        this.showLoader();

        formData = new FormData();
        formData.append('resourceType', 'image');
        formData.append('resourcePath', file, file.name);
        formData.append('updateMember', true);
        formData.append('invalidate_client', true);

        userActions.updateUserImage(formData, dispatch)
            .then(this.hideLoader)
            .then(
                ()=>callback(this.props.user.imageURL)
            );
    }

    getProfilePicture(){
        let image = this.props.user.imageURL;
        return {
            backgroundImage: image ? `url(${image})` : '',
            backgroundSize: image ? 'cover' : '',
            backgroundRepeat: image ? 'no-repeat' : '',
            backgroundPosition: image ? 'center' : ''
        };
    }

    hasProfilePicture(){
        return !!this.props.user.imageURL;
    }

    onClick(e){
        const { onClick:_onClick } = this.props;

        if(typeof _onClick === 'function'){
            // Prevent label opening image input
            e.preventDefault();
            _onClick();
        }
    }

    render() {
        const { className='' } = this.props;

        let isLoading       = this.state.isLoading,
            hasProfileImage = this.hasProfilePicture(),

            isLoadingClass  = isLoading ? styles.isLoading : '',
            hasPhotoClass   = hasProfileImage ? styles.hasPhoto : '',
            title           = hasProfileImage ? 'Change Photo' : 'Upload Photo';

        const Content = isLoading ? Loader : Messaging;

        return (
            <label className={`${styles.userPhoto} ${hasPhotoClass} ${isLoadingClass} ${className} row align-center align-middle dxtrack-user-action`} data-dx-desc={`Click User Photo`} onClick={this.onClick}>
                <div className={`${styles.userPhotoInner} column`} style={this.getProfilePicture()}>
                    <div className={styles.overlay}></div>

                    <div className={`row ${styles.contentContainer}`}>
                        <div className={`column align-self-middle`}>
                            <Content title={title} />
                        </div>
                    </div>
                </div>
                <ImageInput onChange={this.handleImageChange} className={`hide`} />
            </label>
        );
    }
}

const Messaging = ({title}) => {
    return (
        <div className={styles.messaging}>
            <i className="dashboard-icon-camera"></i><br/>
            <span className={styles.uploadTitle}>{title}</span>
        </div>
    );
};

UserPhoto.propTypes = {
    dispatch: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    callback: PropTypes.func
};