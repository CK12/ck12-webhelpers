import React, {PropTypes} from 'react';
import styles from 'scss/components/PageSubmenuButton';


const PageSubmenuActions = ({menuActions, dispatch}) => {
    return (
        <ul className={styles.actions}>
            {menuActions.map( (menuAction, index) => {
                return <ActionItem key={index} menuAction={menuAction} dispatch={dispatch} />;
            })}
        </ul>
    );
};

const ActionItem = ({menuAction, dispatch}) => {
    const { title, action } = menuAction;
    return (
        <li className={`${styles.actionItem} dxtrack-user-action`} data-dx-desc={title} onClick={ ()=>dispatch(action()) }>{title}</li>
    );
};

PageSubmenuActions.propTypes = {
    menuActions: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired
};

ActionItem.propTypes = {
    menuAction: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired
};

export default PageSubmenuActions;