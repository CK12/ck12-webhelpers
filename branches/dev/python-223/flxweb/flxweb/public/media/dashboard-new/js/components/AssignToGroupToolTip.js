import React , {Component} from 'react';
import ClickOutSide  from 'react-onclickoutside';
import styles from 'scss/components/AssignToGroupToolTip';
import {modalityAssignLib} from 'externals';
class AssignToGroupToolTip extends Component{
	constructor(props){
		super(props)

        this.state = {
			tooltipWidth:238
        };

        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.assignToGroup = this.assignToGroup.bind(this);
        this.assignToLibrary = this.assignToLibrary.bind(this);
        this.getModalityUrl = this.getModalityUrl.bind(this);
        this.adjustTooltipForUI = this.adjustTooltipForUI.bind(this)
        this.calculateTipPosition = this.calculateTipPosition.bind(this)
	}
	handleClickOutside(evt) {
		const {removeActiveTile} = this.props;
		removeActiveTile()
	}
	componentWillMount(){

	}
	componentDidMount(){
		window.addEventListener('resize',this.handleClickOutside,false)
	}
	getModalityUrl(obj){
        var branch, conceptHandle, modalityType, realm, _realm, modalityHandle, revision,referrer;

        function getParentHandle(obj) {
            if(obj.parent){
            	if (!obj || !obj.parent) {
            		return '';
            	}
            	obj = obj.parent;
            	if (obj.encodedID.match(/\./g) && 1 === obj.encodedID.match(/\./g).length) {
            		return obj.handle;
            	}
            }else{
                if (obj.contextInfo && obj.contextInfo.conceptEID && (obj.contextInfo.conceptEID || (obj.contextInfo.conceptEID.match(/\./g) && 1 === obj.contextInfo.conceptEID.match(/\./g).length))) {
                    return (obj.contextInfo.conceptBranch && obj.contextInfo.conceptBranch.conceptBranchHandle.toLowerCase()) || (obj.collectionHandle && obj.collectionHandle.toLowerCase());
                }
             }
            return getParentHandle(obj);
        }
        referrer = '?referrer=teacher_dashboard_new';
        realm = obj.realm || (obj.modalityInfo && obj.modalityInfo.realm);
        _realm = realm;
        realm = realm ? realm + '/' : '';
        modalityHandle = obj.handle || obj.modalityHandle;
        modalityType = obj.artifactType || obj.modalityType;
        if (
            'book' === modalityType ||
            'tebook' === modalityType ||
            'workbook' === modalityType ||
            'labkit' === modalityType ||
            'quizbook' === modalityType ||
            'section' === modalityType
        ) {
            revision = obj.revisions && obj.revisions[0] ? obj.revisions[0].revision || '' : '';
            revision = revision ? 'r' + revision : '';
            obj = obj.modalityInfo ? obj.modalityInfo :obj;  
            if((obj && obj.collections && obj.collections.length>0  && modalityHandle) ){
            	if(obj.collectionHandle){
            		return '/c/' + obj.collectionHandle + '/' + obj.collections[0].conceptCollectionAbsoluteHandle + '/' + obj.modality_type + (_realm ? ('/'+_realm) : '') + '/' + modalityHandle + referrer;
            	}
            	return '/c/' + obj.collections[0].collectionHandle + '/' + obj.collections[0].conceptCollectionAbsoluteHandle + '/' + modalityType + (_realm ? ('/'+_realm) : '') + '/' + modalityHandle + referrer;
            }
            if (!revision || !modalityType || !modalityHandle) {
                return '';
            }
            return '/' + realm + modalityType + '/' + modalityHandle + '/' + revision + '/'+referrer;
        }
        branch = getParentHandle(obj.domain || (obj.modalityInfo && obj.modalityInfo.domain)/* || obj.contextInfo.conceptBranch.conceptBranchHandle*/) ;
        conceptHandle = obj.domain ? obj.domain.handle : obj.contextInfo.conceptHandle;
        if((obj.modalityInfo && obj.modalityInfo.domain)){
        	conceptHandle = obj.modalityInfo.domain.handle;
        }
        branch = branch || 'na';
        obj = obj.modalityInfo ? obj.modalityInfo :obj;  
        if((obj && obj.collections && obj.collections.length>0  && modalityHandle) ){
        	if(obj.collectionHandle){
        		return '/c/' + obj.collectionHandle + '/' + obj.collections[0].conceptCollectionAbsoluteHandle + '/' + obj.modality_type + (_realm ? ('/'+_realm) : '') + '/' + modalityHandle + referrer;
        	}
        	return '/c/' + obj.collections[0].collectionHandle + '/' + obj.collections[0].conceptCollectionAbsoluteHandle + '/' + modalityType + (_realm ? ('/'+_realm) : '') + '/' + modalityHandle + referrer;
        }
        if (!conceptHandle || !modalityType || !modalityHandle) {
            return '';
        }
        return '/' + branch.toLowerCase() + '/' + conceptHandle + '/' + modalityType + '/' + realm + modalityHandle + '/'+referrer;

	}
	assignToGroup(){
		const {activeTileContext,removeActiveTile} = this.props;
		let url = this.getModalityUrl(activeTileContext.state.activeTileInfo.modality),
		 _modality = Object.assign({},activeTileContext.state.activeTileInfo.modality,{'context_url':url});
		if(_modality.modalityInfo){
			_modality = Object.assign({},activeTileContext.state.activeTileInfo.modality.modalityInfo,{'context_url':url});
		}
		modalityAssignLib(_modality);
		removeActiveTile();
	}
	assignToLibrary(){
		const {activeTileContext,checkInLibrary,removeActiveTile} = this.props;
		let info = {
				'artifactID':activeTileContext.state.activeTileInfo.modality.artifactID,
				'objectID':activeTileContext.state.activeTileInfo.modality.artifactRevisionID || (activeTileContext.state.activeTileInfo.modality.modalityInfo && activeTileContext.state.activeTileInfo.modality.modalityInfo.artifactRevisionID),
				'objectType': 'artifactRevision'
		}
		checkInLibrary(info);
		removeActiveTile();
	}
	calculateTipPosition(activeTilePosition,activeTileWidth){
		if(window.innerWidth <= 440){
			return {
				beforeToolTip:{
					left:activeTilePosition.left - activeTileWidth*1.25
				},
				afterToolTip:{
					left:activeTilePosition.left - activeTileWidth*1.25
				}
			}
		}else{
			return {
				beforeToolTip:{
					left:''
				},
				afterToolTip:{
					left:''
				}
			}
		}
	}
	adjustTooltipForUI(activeTilePosition,activeTileWidth){
		let windowWidth = window.innerWidth,leftOffset=20,left,top,beforeToolTip = styles.beforeToolTipLeft,afterToolTip = styles.afterTooltipLeft;
		if(windowWidth <= (activeTilePosition.left + (this.refs.tooltip && this.refs.tooltip.clientWidth || this.state.tooltipWidth) + leftOffset)){
			left = activeTilePosition.left - activeTileWidth - (this.refs.tooltip && this.refs.tooltip.clientWidth || this.state.tooltipWidth);
			top = activeTilePosition.top;
			beforeToolTip = styles.beforeTooltipRight;
			afterToolTip = styles.afterTooltipRight;
		}else{
			left = activeTilePosition.left + leftOffset;
			top = activeTilePosition.top;
			beforeToolTip = styles.beforeTooltipLeft;
			afterToolTip = styles.afterTooltipLeft;
		}

		return  {
				position:{
					left,
				    top
				},
				beforeToolTip,
				afterToolTip
			}
	}
	render(){
		const {activeTileContext,activeTilePosition,activeTileWidth,placedInLibrary} = this.props;
		let activeClass = activeTileContext ? styles.active : "",
			tooltipStyle = this.adjustTooltipForUI(activeTilePosition,activeTileWidth),
			tipStyle = this.calculateTipPosition(activeTilePosition,activeTileWidth);

		return (
				<div className={`${styles.assignToGroupToolTip} ${activeClass} `} style={tooltipStyle.position} ref="tooltip">
					{
						(()=>{
							if(activeTileContext !==""){
								return <AssignContentDes  placedInLibrary={placedInLibrary} getModalityUrl={this.getModalityUrl} content={activeTileContext.state.activeTileInfo.modality} assignToGroup={this.assignToGroup} assignToLibrary={this.assignToLibrary}/>
							}
						})()
					}

					<span style={tipStyle.beforeToolTip} className={`${styles.beforeTooltip} ${tooltipStyle.beforeToolTip}`}></span>
					<span style={tipStyle.afterToolTip} className={`${styles.afterTooltip} ${tooltipStyle.afterToolTip}`}></span>
				</div>
		)

	}
}
const AssignContentDes = (props) =>{
	const {content,getModalityUrl,assignToGroup,assignToLibrary,placedInLibrary} = props;
	let url = getModalityUrl(content),
        artifactID = content.artifactID,
		isPlaced = placedInLibrary.indexOf(`${content.artifactID}`) !== -1;
	return (

			<div className={`${styles.assignContentWrapper}`}>
				<div className={`${styles.assignContentHeader} dxtrack-user-action`} data-dx-desc={`Click modality title link`} data-dx-artifactID={artifactID}><a href={url} target={`_blank`}>{content.modalityTitle || content.title || (content.domain && content.domain.name)}</a></div>
				<div className={`${styles.assignContentDescription}`}>{(content.domain && content.domain.description) || (content.modalityInfo && content.modalityInfo.domain && content.modalityInfo.domain.description)}</div>
				<div className={`${styles.assignContentButtonsWrapper}`}>
					<Button name={`ASSIGN TO CLASS`} data-dx-artifactID={artifactID} onClickButton={assignToGroup} artifactID={artifactID}/>
					{
						((isPlaced) =>{
							if(isPlaced){
								return <Button name={`ALREADY IN LIBRARY`} disabled={true} artifactID={artifactID}/>
							}else{
								return <Button name={`PLACE IN LIBRARY`} onClickButton={assignToLibrary} artifactID={artifactID}/>
							}
						})(isPlaced)
					}
					<Button name={`PREVIEW`}  url={url} artifactID={artifactID}/>
				</div>
			</div>
	)
}
const Button = (props) =>{
	const {name,onClickButton,disabled,url,artifactID} = props;
	let disableClass = disabled ? styles.disabled : "";
	return (

			<div className={`${styles.standardButton} dxtrack-user-action ${disableClass}`} data-dx-desc={`Click ${name}`} data-dx-artifactID={artifactID} onClick={onClickButton}>
			{url ? <a target={`_blank`} href={url}>{name}</a> : name}
			</div>
	)
}
export default ClickOutSide(AssignToGroupToolTip);
