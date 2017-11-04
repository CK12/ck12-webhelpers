class MenuOption extends React.Component{
    constructor(){
        super();
    }
    render(){
        let {
            icon,
            text,
            showDividerLine,
            imageSrc,
            textSmall,
            dataDxDesc,
            dataDxReferrer,
            navigateTo,
            targetView,
            disabled
        } = this.props;
        return (
            <div className={ disabled ? 'hide-for-small large-6 columns option-container': 'large-6 columns option-container'}>
                <div className={disabled? 'disabled option-wrapper': 'option-wrapper'} onClick={()=>{
                    disabled? null: navigateTo(targetView);
                }}>
                    <div className="image-container">
                        <i className={`${icon} option-img`}></i>
                    </div>
                    <a className="show-for-small nav-btn-small dxtrack-user-action" data-dx-desc={dataDxDesc} data-dx-referrer={dataDxReferrer}>{textSmall? textSmall: text}</a>
                    <a className="container-message hide-for-small dxtrack-user-action" data-dx-desc={dataDxDesc} data-dx-referrer={dataDxReferrer}>{text}</a>
                    <div className={showDividerLine? "vertical-line hide-for-small": "hide"}></div>
                </div>
            </div>
        );
    }
}
export default MenuOption;
