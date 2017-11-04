import React from 'react'; // eslint-disable-line no-unused-vars
import flxwebSubjectInfo from '../config/subjectInfo';
import {getHandle, getCollectionSubject} from '../selectors/selectors';
import {connect} from 'react-redux';
import {openLTIWindow} from '../utils/requireBridge';
//TODO, create multiple independant badge components (or make one configurable badge component)
const AnnouncementBadges = (props) => {
  var plixUrl = null
  var studyGuideUrl = null
  var simsUrl = null
  if (props.collectionSubject.name.toLowerCase() in flxwebSubjectInfo &&
      props.collectionHandle.toLowerCase() in flxwebSubjectInfo[props.collectionSubject.name.toLowerCase()].branches)
  {
    const subjectInfo = flxwebSubjectInfo[props.collectionSubject.name.toLowerCase()].branches[props.collectionHandle.toLowerCase()]
    if ('plixURL' in subjectInfo) plixUrl = subjectInfo.plixURL
    if ('studyguideURL' in subjectInfo) studyGuideUrl = subjectInfo.studyguideURL
    if ('simsURL' in subjectInfo) simsUrl = subjectInfo.simsURL
  }
  if (plixUrl || studyGuideUrl || simsUrl)
    return (
      <div id="announce" className="row announce hide-small " style={{paddingTop:"35px",  paddingBottom:"5px", paddingLeft:"10%",  paddingRight:"10%"}}>

        {simsUrl != null &&
          <a className="small-6 large-6 columns pointer js-announce"
            style={{padding:"0px", paddingBottom:"15px"}} target={simsUrl} href={simsUrl}
            onClick={(props.lmsContext)?(e)=>{
              e.preventDefault();
              openLTIWindow(`${simsUrl}&lmsContext=true`);
            }:null}
            >
            <div className="left announce-img">
              <img src={"/media/common/images/sim-" + props.collectionHandle + ".png"} />
            </div>
            <div className="left announce-text">
              <b>Simulations</b><span> - Discover a new way of learning Physics using Real World Simulations.</span>
            </div>
          </a>
        }

        {plixUrl != null &&
          <a
            className="small-6 large-6 columns pointer js-announce browse-announce" style={{padding:"0px", paddingBottom:"15px"}} target={plixUrl} href={plixUrl}
            onClick={(props.lmsContext)?(e)=>{
              e.preventDefault();
              openLTIWindow(plixUrl);
            }:null}
            >
            <div className="left announce-img">
              <img src="/media/common/images/start_browse_plix.png" />
            </div>
            <div className="left announce-text">
              <b>PLIX</b><span> - Play, Learn, Interact and Xplore a concept with PLIX.</span>
            </div>
          </a>
        }

        {studyGuideUrl != null &&
          <a className="small-12 large-6 columns pointer js-announce left announcement"  style={{padding:"0px", paddingBottom:"15px"}} target={studyGuideUrl} href={studyGuideUrl}>
            <div className="left announce-img">
              <img src="/media/common/images/study_guides1.png" />
            </div>
            <div className="left announce-text">
              <b>Study Guides</b><span> - A quick way to review concepts.</span>
            </div>
          </a>
        }

      </div>
    );
  else return null;
};

const mapStateToProps = (state) => {
  return {
    collectionHandle: getHandle(state),
    collectionSubject: getCollectionSubject(state),
    lmsContext: state.lmsInfo.lmsContext
  };
};

export default connect(
  mapStateToProps,
)(AnnouncementBadges);
