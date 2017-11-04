import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import CourseItem from './CourseItem';

export const sortBySequence = function(array){
  var sequenceObjectMap = {};
  var indexSequenceArray = [];
  var sorted = [];
  function sortNumber(a,b) {
    return a - b;
  }
  for (var i =0 ; i < array.length; i++) {
      sequenceObjectMap[array[i].sequence] = array[i];
      indexSequenceArray.push(Number(array[i].sequence))
  }
  indexSequenceArray.sort(sortNumber)
  for (var i =0 ; i < indexSequenceArray.length; i++) {
      sorted.push(sequenceObjectMap[String(indexSequenceArray[i])]);
  }
  return sorted
}

class NestedExplorer extends Component {
  constructor(props) {
    super(props);
    this.state = {showExpanded: false};
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.setState(prevState => ({
      showExpanded: !prevState.showExpanded
    }));
  }

  render() {
    let {collection} = this.props;
    let depth = 1;
    let collectionHandle = collection.handle
    var sortedContents = sortBySequence(collection.contains)
    let nestedItems = sortedContents.map( (item, idx) => {
      return <CourseItem
        key={['collection_item_',depth,'_',idx].join('')}
        item={item}
        depth={depth}
        collectionHandle={collectionHandle}
        expanded={this.state.showExpanded} />;
    });
    const buttonText = this.state.showExpanded ? 'Collapse All' : 'Expand All';
    const icon = this.state.showExpanded ? 'icon-minus' : 'icon-plus';
    return (
      <div>
        <div id="expand-all-container">
          <a id="expand-all-concepts" className="expand-all" onClick={this.onClick}><i className={`${icon} expand-icon`}></i>{`${buttonText}`}</a>
        </div>
        <div id="concept-list-outer-container">

          <div id="concept-list-container">
            {nestedItems}
          </div>
        </div>

      </div>
    );
  }
}


export default NestedExplorer;
