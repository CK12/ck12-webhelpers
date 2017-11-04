import React, {Component, PropTypes} from 'react';
import ClickOutside  from 'react-onclickoutside';

import PageSubmenuActions from './PageSubmenuActions';
import styles from 'scss/components/PageSubmenuButton';

class PageSubmenuButton extends Component {
    constructor(props) {
        super(props);

        this.state = {
            active: false
        };

        this.onClick    = this.onClick.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
    }

    handleClickOutside() {
        this.setState(Object.assign({}, this.state, {
            active: false
        }));
    }

    onClick(){
        this.setState(Object.assign({}, this.state, {
            active: !this.state.active
        }));
    }

    render() {
        const { buttonActions, dispatch } = this.props;
        const activeClass = this.state.active ? styles.active : '';

        return (
            <div className={`${styles.container} ${activeClass}`}>
                <button onClick={this.onClick} type="button" className={`${styles.button} dxtrack-user-action`} data-dx-desc={"Open submenu"}>
                    <i className="icon-plus"></i>
                </button>
                <PageSubmenuActions menuActions={buttonActions} dispatch={dispatch} />
            </div>
        );
    }
}

PageSubmenuButton.propTypes = {
    buttonActions: PropTypes.array,
    dispatch: PropTypes.func.isRequired
};

export default ClickOutside(PageSubmenuButton);