import React from 'react'; // eslint-disable-line no-unused-vars
const SubjectItem = (props) => {
  let {
    title,
    handle,
    courseHandle,
    icon,
    forSmallBreakpoint,
    showCLink
  } = props;
  console.log(showCLink)
  let url = showCLink ? `/c/${handle}/` : `/${handle}/`;
  return (
      <a id={`browse-${forSmallBreakpoint?'small':''}-${handle}`} className="link-green subject-link" href={url} title={title}>
        <span>
          <span className="subject-icon" style={{display:'inline-block'}}>
            <img src={icon} />
          </span>
          <span className="subject-browse-title">{title}</span>
        </span>
      </a>
  );
};

export default SubjectItem;