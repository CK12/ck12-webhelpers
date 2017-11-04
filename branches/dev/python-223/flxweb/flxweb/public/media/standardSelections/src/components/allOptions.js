const AllOptions = ({
    data,
    login,
    collapse,
    hideButton,
    showMore,
    onOptionClick
})=>{
    return(
        <div style={styles.container}>
           <li style={styles.more} key={'more'} onClick={(e)=>{
                e.preventDefault();
                showMore();
            }} className={login && !hideButton ? 'notclickable more' : 'hide'}>
                 <div>{collapse? 'View More Standards': 'Collapse'}</div>
                 <span className={collapse? 'icon-expand-arrow-down': 'icon-collapse-arrow-up'}></span>
            </li>
            <div className={collapse? 'hide': ''}>
            {data.map(standardData => {
                let category = (<li style={styles.category} className="notclickable">{standardData.category}</li>);
                let standards = standardData.standards.map(standard => (
                    <li key={standard.longname}
                        className="dxtrack-user-action"
                        data-dx-desc="standard_dropdown_option"
                        data-dx-eventname="FBS_STANDARDS"
                        data-dx-standardName={standard.longname}
                        data-dx-standardboardid = {standard.id}
                        onClick={()=>onOptionClick(standard)}
                    >{standard.longname}</li>
                ));
                return [category, standards];
            })}
            </div>
        </div>
    );
};

const styles = {
    li:{
        marginTop: '5px'
    },
    container:{
        borderTop: '1px solid #ccc'
    },
    more:{
        padding: '10px 0 10px 0',
        textAlign: 'center',
        color: '#818b90',
        fontSize: '12px'
    },
    category:{
        paddingLeft:'27px',
        paddingTop: '5px',
        color: '#918f8f'
    }
};
export default AllOptions;
