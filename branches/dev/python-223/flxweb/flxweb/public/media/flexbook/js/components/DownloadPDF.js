import React from 'react';
import {connect} from 'react-redux';
import AlertModal from './common/AlertModal';
import {generatePDFRevision} from '../actions/actions.js';
import { fetchPDFDownloadInfo, submitPDFDownloadInfo } from '../actions/pdfDownloadInfo';
import {
  getCurrentSectionArtifact,
  getGeneratedPDF,
  getPDFDownloadInfo
} from '../selectors/selectors.js';
import {DOWNLOADPDFNOTIFICATION} from '../constants/placeholders';
import {logADSEvent} from '../utils/requireBridge';
import PDFInfoModal from './PDFInfoModal';

class DownloadPDF extends React.Component{

  componentDidMount(){  
    let {artifact:{id}} = this.props;
    this.props.fetchPDFDownloadInfo(id);
    this.submitPDFInfo = this.submitPDFInfo.bind(this);
  }

  componentWillReceiveProps(nextProps){
    let { pdfDownloadInfo:{infoSubmitted: wasSubmitted}} = this.props;
    let {pdfDownloadInfo:{infoSubmitted}, response:{userdata, status}} = nextProps;
    
    if (infoSubmitted && infoSubmitted!=wasSubmitted){
      this.generatePDF()
    }
    else if(infoSubmitted && status == 'SUCCESS' && userdata && userdata.downloadUri)
    {
      window.open(userdata.downloadUri);
      this.props.callbackParent();
    }
  }

  generatePDF(){
    let revision = (this.props.artifact.revisions) ? this.props.artifact.revisions[0].id : this.props.artifact.revisionID;
    let artifactInfo = {'id':this.props.artifact.id , 'revision': revision };
    this.props.generatePDFRevision(artifactInfo);
    logADSEvent('FBS_DOWNLOAD',{artifactID:this.props.artifact.id, format:'pdf'});
  }

  submitPDFInfo(info){
    console.log('in submitPDFInfo',info);
    let { artifact: { id }, submitPDFDownloadInfo } = this.props
    submitPDFDownloadInfo({
      ...info,
      artifactID:id
    })
  }

  render(){
    let {pdfDownloadInfo:{loaded: infoLoaded, infoSubmitted}, response:{status, loading}} = this.props;
    let headerText = DOWNLOADPDFNOTIFICATION['headerText'];
    let contentBody = DOWNLOADPDFNOTIFICATION['contentBody'];
    let {state,callbackParent} = this.props;
    let alertInfo = { state, headerText, contentBody, callbackParent  };

    return(
      <div className='downloadpdf'>
				{ infoLoaded?
            (infoSubmitted?(
              (!loading && status!='SUCCESS') && <AlertModal  {...alertInfo}/>):
              (<PDFInfoModal onClose={callbackParent} onSubmit={this.submitPDFInfo}  />)
            ):
            null
        }
			</div>
    );
  }
}

const mapStateToProps = (state) => {
  let artifact = getCurrentSectionArtifact(state);
  let response = getGeneratedPDF(state);
  let pdfDownloadInfo = getPDFDownloadInfo(state);
  return{
    artifact,
    response,
    pdfDownloadInfo
  };
};

export default connect(
	mapStateToProps,
  {
    generatePDFRevision,
    fetchPDFDownloadInfo,
    submitPDFDownloadInfo
  }
)(DownloadPDF);
