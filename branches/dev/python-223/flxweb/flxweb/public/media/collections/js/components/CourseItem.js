import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {getConceptPageURL} from '../utils/collectionUtils';
import LevelItem from './LevelItem';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'; // ES6
import {sortBySequence}  from './NestedExplorer'

class CourseItem extends Component {
  constructor(props) {
    super(props);
    this.state = {showSubtree: this.props.expanded};
    this.onClick = this.onClick.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({showSubtree: nextProps.expanded});
  }

  onClick() {
    this.setState(prevState => ({
      showSubtree: !prevState.showSubtree
    }));
  }

  render() {
    let {item, depth, collectionHandle} = this.props;
    let {title} = item;
    const childVisibility = this.state.showSubtree ? 'show-child-concepts' : 'hide-child-concepts';
    const clicked = this.state.showSubtree ? 'clicked' : '';

    var sortedContents = sortBySequence(item.contains)
    let contents = sortedContents.map((subitem, idx) => {
      return(
        <LevelItem
          key={['collection_item_',depth,'_',idx].join('')}
          item={subitem}
          depth={depth+1}
          collectionHandle={collectionHandle}
          expanded={this.state.showSubtree} />
      );
    });
    if (contents.length){
      return (
        <div className={'concept-container'}>
          <a className={`level-${depth}-concept ${childVisibility} ${clicked}`} style={{paddingLeft:'45px'}} onClick={this.onClick}>
            <i className="concept-arrow-image"></i>
            <span className="concept-name" title={title}>{title}</span>
          </a>
          <ReactCSSTransitionGroup
              component="div"
              transitionName="nested-browse"
              transitionEnterTimeout={500}
              transitionLeaveTimeout={300}
              className={'show-lists level1-inner-container'} style={{overflow:'hidden', height:'auto'}}>
               {(this.state.showSubtree) &&
               <div style = {{height:'30px' }}></div>
              }
               <div style={{display: this.state.showSubtree ? 'block' : 'none', marginTop:'-30px'}}>{contents}</div>
          </ReactCSSTransitionGroup>
        </div>
      );
    } else {
      return (
        /*<div className={`level-${depth}-concept-container`}>
          <a className="level-two-title" href={ getConceptPageURL(collectionHandle, item) }>
            <span className="level2-title sublist-title" title={title}>{title}</span>
          </a>
        </div>*/
        <div className={'concept-container'}>
          <a className={`level-${depth}-concept ${childVisibility} ${clicked}`} style={{paddingLeft:'45px'}} onClick={this.onClick}>
            <i className="concept-arrow-image"></i>
            <span className="concept-name" title={title}>{title}</span>
          </a>
          <ReactCSSTransitionGroup
              component="div"
              transitionName="nested-browse"
              transitionEnterTimeout={500}
              transitionLeaveTimeout={300}
              className={'show-lists level1-inner-container'} style={{overflow:'hidden', height:'auto'}}>
               {(this.state.showSubtree) &&
               <div style = {{height:'30px' }}></div>
              }
               <div style={{display: this.state.showSubtree ? 'block' : 'none', marginTop:'-30px'}}>
                 <LevelItem
                  key={['collection_item_',depth,'_',1].join('')}
                  item={item}
                  depth={depth+1}
                  collectionHandle={collectionHandle}
                  expanded={this.state.showSubtree} />
               </div>
          </ReactCSSTransitionGroup>
        </div>
      );
    }
  }
}

export default CourseItem;
