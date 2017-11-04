import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {getConceptPageURL} from '../utils/collectionUtils';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'; // ES6
import {sortBySequence}  from './NestedExplorer'

class LevelItem extends Component {
  constructor(props) {
    super(props);
    this.state = {showSubtree: false};
    this.onClick = this.onClick.bind(this);
  }

  componentWillReceiveProps(nextProps) {
   // if(nextProps.expanded != this.props.expanded){
    this.setState({showSubtree: nextProps.expanded});
   // }
  }

  componentDidMount() {
    this.setState({showSubtree: this.props.expanded});
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
    let contents = sortedContents.map((litem, idx) => {
      return(
        <LevelItem
          key={['collection_item_',depth,'_',idx].join('')}
          item={litem}
          depth={depth+1}
          collectionHandle={collectionHandle}
          expanded={this.props.expanded} />
      );
    });

    if (contents.length){
      return (
        <div className={`level${depth}_parent`}>
        <a className={`${childVisibility} ${clicked}`} onClick={this.onClick}
        style={{ paddingLeft: '48px',
          position: 'relative',
          paddingTop: '3px',
          paddingBottom: '3px',
          display: 'inline-block'}}>
        <i className="concept-arrow-image" style={{transform: `rotate(${(this.state.showSubtree)?'90':'0'}deg)`}}></i>
        <span className="concept-name" title={title}>{title}</span>
        </a>
        <ReactCSSTransitionGroup
        component="div"
        transitionName="nested-browse"
        transitionEnterTimeout={400}
        transitionLeaveTimeout={300}
        className={'sublist row collapse indent-concepts'}
        style={{overflow:'hidden', padding: '0px 0px 0px 35px'}}>
        {(this.state.showSubtree) &&
          <div style = {{height:'30px' }}></div>
        }
        <div style={{display: this.state.showSubtree ? 'block' : 'none', marginTop:'-30px'}}>{contents}</div>
        </ReactCSSTransitionGroup>
        </div>
      );
    } else {
      return (
        <div className={`level-${depth}-concept-container`}>
        <a href={ getConceptPageURL(collectionHandle, item) }
        style={{paddingLeft: '48px',
          position: 'relative',
          paddingTop: '3px',
          paddingBottom: '3px',
          color: '#00aba4',
          display: 'inline-block'}}>
        <span style={{lineHeight: '30px'}} title={title}>{title}</span>
        </a>
        </div>
      );
    }
  }
}

export default LevelItem;
