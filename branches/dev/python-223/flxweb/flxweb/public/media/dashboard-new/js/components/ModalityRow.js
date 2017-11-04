import React, {Component} from 'react';
import {find, chunk} from 'lodash';
import $ from 'jquery';
import styles from 'scss/components/ModalityRow';

const MAX_TILES_PER_ROW = 4;
let noOfModalities = 0;
const ModalityRow = (props) => {
    const { data, title, icon, iconVisible, color, onClickOfTile } = props;

    return(
        <div className='row'>
            <div className={`small-12 columns ${styles.modalityRowWrapper}`}>
                <ModalityRowTitleContainer title={title} icon={icon} color={color}/>
                <ModalityContentBody iconVisible={iconVisible} modalities={data} onClickOfTile={onClickOfTile}/>
            </div>
        </div>
    );
};
export default ModalityRow;

const ModalityRowTitleContainer = (props) => {
    const {title, icon, color} = props;
    let style = {
        color:color
    };

    if(!title){ return null; }

    return (
        <div className={`row ${styles.modalityRowTitleContainer}`}>
            <div className='column'>
                <span style={style}>
                    <i className={icon}></i>
                </span>
                <span className={styles.modalityTitle}>
                    {title}
                </span>
            </div>
        </div>
    );
};

class ModalityContentBody extends Component{
    constructor(props){
        super(props);

        this.state = {
            activeTile:'',
            activeTileInfo:{},
            tileWidth:'',
            translateIndex:0,
            maxVisibleTile: MAX_TILES_PER_ROW
        };

        this.onClickRight = this.onClickRight.bind(this);
        this.onClickLeft = this.onClickLeft.bind(this);
        this.onTileClick = this.onTileClick.bind(this);

        this.removeActiveTile = this.removeActiveTile.bind(this);

        this.isLeftArrowActive = this.isLeftArrowActive.bind(this);
        this.isRightArrowActive = this.isRightArrowActive.bind(this);
    }
    onClickRight(){
        this.setState(
            Object.assign({},this.state,
                {
                    translateIndex: this.state.translateIndex + 1
                }
            )
        );
    }
    onClickLeft(){
        this.setState(
            Object.assign({},this.state,
                {
                    translateIndex: this.state.translateIndex - 1
                }
            )
        );
    }
    onTileClick(evt,id){
        const {modalities, onClickOfTile} = this.props;
        const el = evt.currentTarget;
        const $el = $(el);
        const offset = $el.offset();
        const parentOffset = $el.parent().offset();
        let modality = find(modalities, (o)=>{
            /*if(o.modalityInfo){
                return o.modalityInfo.id == id;
            }*/
        	/*if(o.modality){*/
        		//return o.modalityID == id;  
        	/*}*/
        	if(o.domain){
        		return o.id == id;
        	}
            return o.modalityID == id;
        });
        /*if(modality && modality.modalityInfo){ modality = modality.modalityInfo; }*/

        this.setState(
            Object.assign({}, this.state, {
                activeTile: id,
                activeTileInfo: {
                    modality: modality,
                    position: {
                        left: (offset.left + el.offsetWidth),
                        top: offset.top
                    },
                    tileWidth:el.offsetWidth
                }
            }),
            ()=>onClickOfTile(this)
        );
    }
    isRightArrowActive(){
        const { translateIndex, maxVisibleTile} = this.state;
        return ((translateIndex + 1) * maxVisibleTile) < noOfModalities;
    }
    isLeftArrowActive(){
        return this.state.translateIndex > 0;
    }
    removeActiveTile(){
        this.setState(Object.assign({},this.state,{
            activeTile:''
        }));
    }
    render(){

        const {modalities, iconVisible} = this.props;
        const {translateIndex, activeTile } = this.state;
        noOfModalities = this.props.modalities.length;
        const rightArrowActive = this.isRightArrowActive();
        const leftArrowActive = this.isLeftArrowActive();
        const rows = chunk(modalities, MAX_TILES_PER_ROW);

        return (
            <div className={`row ${styles.modalityContentBody}`}>
                <NavigationArrow  arrowClass={styles.arrowContainer} onClick={this.onClickLeft} dir='left' active={leftArrowActive}/>
                <div className={`column small-10 ${styles.tilesContainer} relative`} ref='tilesContainer'>
                    {rows.map((row, i) =>
                        <ModalityTiles key={i} iconVisible={iconVisible} row={row} onTileClick={this.onTileClick} activeTile={activeTile} rowIndex={i} translateIndex={translateIndex} />
                    )}
                </div>
                <NavigationArrow  arrowClass={styles.arrowContainer} onClick={this.onClickRight} dir='right' active={rightArrowActive}/>
            </div>
        );
    }
}

const ModalityTiles = ({row, iconVisible, onTileClick, activeTile, rowIndex, translateIndex}) => {

    let translateX = '0%'; // When the same index
    // let modalityType;

    if(rowIndex < translateIndex) {
        translateX = '-100%';
    } else if(rowIndex > translateIndex) {
        translateX = '100%';
    }

    const style = {
        transform: `translateX(${translateX})`
    };

    return (
        <div className={`row ${styles.tileRow}`} style={style}>
            {row.map((modality, i) => {
                if(modality.modalityInfo){ modality = modality.modalityInfo; }
                return <ModalityTile iconVisible={iconVisible} key={`${modality.artifactID || modality.modalityType}.${i}`} modality={modality} modalityType={modality.artifactType || modality.modalityType} onTileClick={onTileClick} id={modality.id || modality.modalityID} activeTile={activeTile}/>;
            })}
        </div>
    );
};
const getPracticeETA = (props)=>{
	const {internalTagGrid} =props.modality;
	let eta;
	//const internalTagGrid =  [96295, "practice_eta=1200"]; //constant for local use
	if(!(internalTagGrid && internalTagGrid.length>0)){
		eta = 10;
	}else{
		eta = internalTagGrid[0].map((value,index,arr)=>{
			value = value.toString();
			if(value.match(/practice_eta=\d+/)){
				value =  parseInt(value.match(/\d+/))/60;
				value = Math.ceil(value)
				return value;
			}
		})
	}

	return eta;
}
const ModalityTile = (props) => {

    const {modality, modalityType, iconVisible, onTileClick, id, activeTile} = props;
    let activeClass = (activeTile === id) ? styles.activeTile :'';
    let practiceImage = '';
    let eta = '';
    let offsetLeft = iconVisible ? styles.offsetLeft : '';
    let name = props.modalityType==="simulationint"? (props.modality.handle || modality.modalityTitle) :(modality.modalityTitle || modality.title) ;
    const onClick = (evt)=>onTileClick(evt,id);
   /* if(!modality.domain){
    	return null;
    }*/
    if(modalityType === 'asmtpractice'){
       practiceImage = '/media/images/modality_generic_icons/practice_image.png';
       eta = getPracticeETA({modality});
    }
    let bImage = practiceImage ? practiceImage : ((modality.modalityLatestRevisionCoverResources && (modality.modalityLatestRevisionCoverResources.length !== 0) && modality.modalityLatestRevisionCoverResources[0].modalityLatestRevisionCoverResourceSatelliteURL) || modality.coverImage || (modality.domain && modality.domain.previewImageUrl));
   /*if(name !== ""){*/
	   return (
        <div className={`column small-3 ${styles.tile} ${activeClass} dxtrack-user-action`} data-dx-desc={`Click Modality Tile`} onClick={onClick} data-dx-artifactID={id} id={id}>
            <div className={`row ${styles.rowOffset}`}>
                <div className={`small-12 column ${styles.tileImage}`}>
                    {/* Fallback to coverImage since simulation modalities do not have coverImageSatelliteUrl */}
                    <div className={`${styles.image} row row--fullWidth`} style={{ backgroundImage: `url(${bImage})` }}>
                    {(modalityType === 'asmtpractice') ? <ShowCircle modalityType={modalityType} eta = {eta}/> : null }
                    </div>
                </div>
            </div>
            <div className={`row ${styles.rowOffset}`}>
                <div className={`small-12 column ${styles.tileDescription}`}>
                   	<ConceptTitle iconVisible={iconVisible} modalityType={modalityType} name={name}/>
                	  <div className={`${styles.subject} ${offsetLeft}`}>{(modality.domain && modality.domain.branchInfo.name) || (modality.contextInfo && modality.contextInfo.conceptBranch && modality.contextInfo.conceptBranch.conceptBranchHandle )}</div>
                </div>
            </div>
        </div>
    );	   
};

const ConceptTitle = (props) =>{
	let {iconVisible,modalityType,name} = props;
	if(props.iconVisible){
       return <div className={`${styles.concept}`}><ShowIcon iconVisible={iconVisible} modalityType={modalityType}/><div className = {`${styles.modalityTileTitle}`}><div className = {`${styles.modalityTileTitleText}`}>{name}</div></div></div>
	}else{
       return <div className={`${styles.concept}`}><div className={`${styles.conceptTitle}`}>{name}</div></div>
	}
}

const ShowCircle = (props) => {
    const {eta,modalityType} = props
	return (
        <div className={`${styles.score_circle} row`}>
            <div className={`${styles.content}`}>
                <span className={`${styles.small_text}`}>Estimated</span>
                <span className={`${styles.large_text}`}>{eta}</span>
                <span className={`${styles.attach_text}`}> mins</span>
                <span className={`${styles.small_text}`}>to complete</span>
            </div>
        </div>
    )
}

const ShowIcon = (props) => {
    const {modalityType, iconVisible} = props;
    if(!iconVisible)
      return null;
    let iconClass;
    let icons = {
        'book'			: 'icon-read',
    	'lesson'        : 'icon-read',
        'enrichment'    : 'icon-video',
        'lecture'		: 'icon-video',
        'asmtpractice'  : 'icon-exercise',
        'plix'          : 'icon-interactive_practice',
        'rwa'           : 'icon-rwa',
        'simulationint' : 'icon-simulations'
    };
    find(Object.keys(icons), (item) => {
      if(item == modalityType)
        return iconClass = icons[item];
    });
    return (
        <span className={`${styles.modalityTileIcon}`}>
          <i className={iconClass}></i>
        </span>
    );
};

const NavigationArrow = (props) => {
    const {arrowClass, onClick, dir, active, leftText, rightText} = props;

    let activeClass = active ? styles.active :'';

    return (
        <div className={`column ${arrowClass}`} >
            <span className={`${activeClass} dxtrack-user-action`} onClick={onClick} data-dx-desc={`Click ${dir} arrow button`}>
                {leftText}
                <i className={`icon-arrow3_${dir}`}></i>
                {rightText}
            </span>
        </div>
    );
};
