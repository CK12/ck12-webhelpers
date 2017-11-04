import React , {Component} from 'react';

import ModalityRow from 'components/ModalityRow'
import AssignToGroupToolTip from 'components/AssignToGroupToolTip'
import styles from 'scss/components/RecommendedBySubjects';

class RecommendedBySubjects extends Component{
    constructor(props){
        super(props);

        // using dummy state for UI { remove it once you get apis for modalities}
        this.state = {
            activeTileContext:'',
            activeTilePosition:{left:0,top:0},
            activeTileWidth:'',
            recentlyViewedModalities:{
                'recentlyViewed' : {
                    'title' : '',
                    'icon':'',
                    'color':''
                }
            },
            trendingModalities : {
                'lessons' : {
                    'title' : 'Read',
                    'icon':'icon-read',
                    'color':'#646362'
                },
                'asmtpractice' : {
                    'title' : 'Practice',
                    'icon':'icon-exercise',
                    'color':'#646362'
                },
                'videos' : {
                    'title' : 'Videos',
                    'icon':'icon-video',
                    'color':'#646362'
                },
                'plix' : {
                    'title' : 'Plix',
                    'icon':'icon-interactive_practice',
                    'color':'#646362'
                },
                'rwa' : {
                    'title' : 'Real World',
                    'icon':'icon-rwa',
                    'color':'#646362'
                },
                'simulationint' : {
                    'title' : 'Simulations',
                    'icon':'icon-simulations',
                    'color':'#646362'
                }
            }
        };
        this.onClickOfTile = this.onClickOfTile.bind(this);
        this.removeActiveTile = this.removeActiveTile.bind(this);
        this.resetActiveTileContext = this.resetActiveTileContext.bind(this);
    }
    resetActiveTileContext(_context){

        if(_context.state.activeTile !== (this.state.activeTileContext && this.state.activeTileContext.state.activeTile)){
            this.removeActiveTile();
        }
        this.setState(Object.assign({},this.state,{
            activeTileContext:_context,
            activeTilePosition:_context.state.activeTileInfo.position,
            activeTileWidth:_context.state.activeTileInfo.tileWidth
        }));


    }
    removeActiveTile(){
        if(this.state.activeTileContext){
            this.state.activeTileContext.removeActiveTile();
            this.setState(Object.assign({},this.state,{
                activeTileContext:''
            }));
        }

    }
    onClickOfTile(_context){
        this.resetActiveTileContext(_context);

    }
    render(){
        const {content,checkInLibrary} = this.props;
        return(
            <div className={`row ${styles.recommendedBysubjectsContent}`}>
                <div className={`column small-12`}>
                    <ModalityRowTitleContainer title={'Recently viewed'} icon={'dashboard-icon-recently'} color={'#2B91D9'} data={content.recentlyViewed}/>
                    {Object.keys(this.state.recentlyViewedModalities).map(
                        key => {
                            if(content[key].length){
                                return <ModalityRow iconVisible={true} onClickOfTile={this.onClickOfTile} key={key} title={this.state['recentlyViewedModalities'][key]['title']} icon={this.state['recentlyViewedModalities'][key]['icon']} color={this.state['recentlyViewedModalities'][key]['color']}data={content[key]}/>
                            }
                        }
                    )}
                    <ModalityRowTitleContainer title={'Trending'} icon={'icon-fire'} color={'#f5bd64'} forced={true}/>
                    <div className={`row`}>
                        <div className={`column`}>
                            <div className={styles.subTag}>Take a look at what teachers just like you are using in their classrooms.</div>
                        </div>
                    </div>
                    {Object.keys(this.state.trendingModalities).map(
                        key => {
                            if(content[key].length){
                                return <ModalityRow onClickOfTile={this.onClickOfTile} key={key} title={this.state['trendingModalities'][key]['title']} icon={this.state['trendingModalities'][key]['icon']} color={this.state['trendingModalities'][key]['color']}data={content[key]}/>;
                            }
                        }
                    )}
                    <AssignToGroupToolTip placedInLibrary={content.placedInLibrary} removeActiveTile={this.removeActiveTile} checkInLibrary={checkInLibrary} {...this.state}/>
                </div>
            </div>
        );
    }

}
//stateless components
const ModalityRowTitleContainer = (props) => {
    const {title,icon,color,data,forced} = props;
    let style = {
        color:color
    };
    if(data && data.length === 0 && !forced){
        return null;
    }
    return (
        <div className={`row ${styles.modalityRowTitleContainer}`}>
            <div className={`column`}>
                <span style={style}><i className={`${icon}`}></i></span>
                <div>{title}</div>
            </div>
        </div>
    );
};

export default RecommendedBySubjects;