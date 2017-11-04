import React from 'react';

import styles from 'scss/components/List';

const MAX_LIST_ITEMS = 5;

const List = ({list, defaultText='', onClick=()=>{}, className=''}) => {
    if(!list.length){
        return <span onClick={onClick} className={`${styles.list} ${className}`}>{defaultText}</span>;
    }

    const remainder = Math.max(0, list.length - MAX_LIST_ITEMS);

    return (
        <span className={`${styles.list} ${className}`}>
            {list.slice(0, MAX_LIST_ITEMS).map((listItem) =>{
                return <ListItem key={listItem} onClick={onClick} listItem={listItem} />;
            })}
            <Remainder remainder={remainder} />
        </span>
    );
};


const Remainder = ({remainder}) => {
    if(!remainder){ return null; }

    return (
        <span className={styles.listItem}>{`${remainder} more`}</span>
    );
};

const ListItem = ({listItem, onClick}) => {
    return (
        <span onClick={onClick} className={styles.listItem}>{listItem}</span>
    );
};

export default List;