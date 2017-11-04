import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {connect} from 'react-redux';
import ConceptsTab from './ConceptsTab';
import BooksTab from './BooksTab';
import { Router, Route, Link, IndexRoute, hashHistory, browserHistory } from 'react-router'
import {getLocation, isLocationFound, isCollectionNonEmpty, isFlexbookNonEmpty, getSubjectLinks} from '../selectors/selectors';
import {getLocationInfo} from '../actions/actions';


/* second method
import { Router, Route, useRouterHistory  } from 'react-router'
import { createHashHistory } from 'history'
const hashHistory = useRouterHistory(createHashHistory)({ queryKey: false })
*/

//TODO: Remove jQuery-ui dependency from tab button css
class TabButton extends Component {
    
    constructor(props) {
        super(props);
        this.buttonHTML = this.buttonHTML.bind(this);
    }

    buttonHTML() {
      if (this.props.pressed && this.props.pressedLabel !== undefined)
        return {__html: this.props.pressedLabel};
      else
        return {__html: this.props.label};
    }

    render()
    {
      const li_classes = (this.props.href == "#view_concepts") ? "tabs-concept " : "last tabs-flexbook "
      const a_classes = (this.props.href == "#view_concepts") ? "concepts-tab " : "flexbook-tab "
      const data_name = (this.props.href == "#view_concepts") ? "concepts" : "books"
      return (
        <li className={li_classes + 'js-browse-tab ui-state-default ui-corner-top' + (this.props.pressed ? ' ui-tabs-active ui-state-active' : '')} role="tab" tabIndex="0" aria-controls="view_list" aria-labelledby="ui-id-4" aria-selected={(this.props.pressed ? 'true' : 'false')}>
           <a className={a_classes + "ui-tabs-anchor"} data-name={data_name} href={this.props.href} role="presentation" tabIndex="-1" id="ui-id-4" dangerouslySetInnerHTML={this.buttonHTML()}></a>
       </li>)
    }
}

class BrowseTabButtons extends Component {
    
    constructor(props) {
      super(props);
    }

    render()
    {
      const showForIndia = (this.props.cbseUrl && 'country_long' in this.props.location && this.props.location.country_long == 'india')
      const tabButtonLabel = '<span>FlexBook® Textbooks</span><span style="display: ' + ((showForIndia) ? 'inline-block;' : 'none;') 
                                                                  + 'font-size: 14px;'
                                                                  + 'font-weight: bold;'
                                                                  + 'padding-left: 0px !important;'
                                                                  + 'position: relative !important;'
                                                                  + 'top: -3px !important;'
                                                                  + 'margin-left: 11px;"'
                                                                  + 'class="cbse-notification-wrapper">'
                                                                  + '<img src="/media/common/images/new_orng_ribbon.png" className="new-label" />'
                                                                  + '<span className="cbse-heading"> CBSE </span>'
                                                                  + '<span> FlexBooks® </span>'
                                                                  + '</span>'
      return (
          <ul className="clear desktop_view ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all" role="tablist">
           {this.props.showConceptsTab &&
            <TabButton
              label="Concepts"
              href = "#view_concepts"
              pressed={this.props.pressedTab == "view_concepts" || !this.props.showBooksTab}
            />}
           {this.props.showBooksTab &&
            <TabButton
              label={tabButtonLabel}
              pressedLabel = '<span>FlexBook® Textbooks</span>'
              href = "#view_books"
              pressed={this.props.pressedTab == "view_books" || !this.props.showConceptsTab}
            />
          }
          </ul>)
    }
}

class BrowseTabs extends Component {
    constructor(props) {
        super(props);
    }

    render() {
      
      if(this.props.locationFound)
      {
        return (
          <div id="browse_tabs" className="js_detailstabs clear ui-tabs ui-widget ui-widget-content ui-corner-all">
            
            <div className="tabs-browse">
              <Router history={hashHistory}>
                <Route path='/' component={() => (<BrowseTabButtons pressedTab="view_concepts"
                                                                    cbseUrl={this.props.cbseUrl} 
                                                                    location={this.props.location}
                                                                    showConceptsTab={this.props.isCollectionNonEmpty} 
                                                                    showBooksTab={this.props.isFlexbookNonEmpty}/>)}/>
                <Route path='view_concepts' component={() => (<BrowseTabButtons pressedTab="view_concepts"  
                                                                                cbseUrl={this.props.cbseUrl} 
                                                                                location={this.props.location} 
                                                                                showConceptsTab={this.props.isCollectionNonEmpty}  
                                                                                showBooksTab={this.props.isFlexbookNonEmpty}/>)}/>
                <Route path='view_books' component={() => (<BrowseTabButtons pressedTab="view_books" 
                                                                             cbseUrl={this.props.cbseUrl} 
                                                                             location={this.props.location} 
                                                                             showConceptsTab={this.props.isCollectionNonEmpty}  
                                                                             showBooksTab={this.props.isFlexbookNonEmpty}/>)}/>
              </Router>
            </div>

            <div className="contentarea browse_contentarea">
              <div className="desktop_view">
                <Router history={hashHistory}>
                  <Route path='/' component={() => 
                    {
                      if (this.props.isCollectionNonEmpty) 
                        return (<ConceptsTab/>);
                      else if (this.props.isFlexbookNonEmpty) 
                        return (<BooksTab location={this.props.location}/>);
                      else 
                        return (<div>No content was found on this topic.</div>)
                    }
                   } />
                  <Route path='view_concepts' component={() => 
                    {
                      if (this.props.isCollectionNonEmpty) 
                        return (<ConceptsTab/>);
                      else if (this.props.isFlexbookNonEmpty) 
                        return (<BooksTab location={this.props.location}/>);
                      else 
                        return (<div>No content was found on this topic.</div>)
                    }
                   } />
                  <Route path='view_books' component={() => 
                    {
                      if (this.props.isFlexbookNonEmpty) 
                        return (<BooksTab location={this.props.location}/>);
                      else if (this.props.isCollectionNonEmpty) 
                        return (<ConceptsTab/>);
                      else
                        return (<div>No content was found on this topic.</div>)
                    }
                   } />
                </Router>
              </div>
            </div>
          </div>
        );
      }
      else 
      {
         this.props.getLocationInfo();
         return (<div></div>);
      } 
    };
}

const mapStateToProps = (state) => {
  return {
    isCollectionNonEmpty: isCollectionNonEmpty(state),
    isFlexbookNonEmpty: isFlexbookNonEmpty(state),
    locationFound: isLocationFound(state),
    location: getLocation(state),
    cbseUrl: getSubjectLinks(state, 'cbseURL')
  };
};

export default connect(
  mapStateToProps,
  {
    getLocationInfo
  }
)(BrowseTabs);