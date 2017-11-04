import React from 'react'; // eslint-disable-line no-unused-vars
import SubjectItem from './SubjectItem';

const SubjectList = (props) => {
  let forSmallBreakpoint = props.forSmallBreakpoint;
  let isActive = props.isActive;
  let branchFilter = props.branchFilter || ( ()=>true );
  let branches = props.branches || {};
  let listContents = Object.keys(branches)
    .map((branchKey)=>branches[branchKey])
    .filter(branchFilter)
    .map((branch)=>{
      let item = (<SubjectItem key={`browse-item-${forSmallBreakpoint?'small':''}-${branch.handle}`} {...branch} />);
      if (forSmallBreakpoint){
        return item;
      } else {
        return (
          <li key={`browse-${branch.handle}`}>
            {item}
          </li>
        );
      }
    });

  if (forSmallBreakpoint){
    return (
      <section className={isActive?'active':''} style={isActive?{paddingTop: '0px'}:{}}>
        <span className="title text-center subject-name-wrapper" data-section-title="" style={ {left: '0px'} }>
          <a className="subject-name">{props.title}</a>
        </span>
        <div className="content browse-content" data-section-content="">
          {listContents}
        </div>
      </section>
    );

  } else {
    return (
      <div className="small-12 large-4 columns browse-subject-container">
        <h3 id="{props.title}">{props.title}</h3>
        <ul className="row browse-content">
          {listContents}
        </ul>
      </div>
    );
  }
};

export default SubjectList;
