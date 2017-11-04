import React from 'react'; // eslint-disable-line no-unused-vars

const BrowseBreadcrumbs = (props) => {
  let crumbs = [
    <a key="crumb_browse" href="/browse/">Browse</a>,
  ];

  if (props.collectionSubject && props.collectionSubjectUrl){
    crumbs.push(<span key="crumb_subject"> / <a href={props.collectionSubjectUrl}>{props.collectionSubject}</a></span>);
  }
  if (props.collectionTitle){
    crumbs.push(<span key="crumb_course" className="branch-name"> / {props.collectionTitle}  </span>);
  }

  return (
    <h1 style = {{maxWidth:"calc(100% - 65px)"}}>{crumbs}</h1>
  );
};

export default BrowseBreadcrumbs;