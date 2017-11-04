import React from 'react';
import {connect} from 'react-redux';
import Radium from 'radium';
import {
    getLevel,
    getCurrentSectionArtifact,
    getCurrentSectionMetadata,
    getAuthors,
    getProcessedSectionContents,
    getDomainNode
} from '../selectors/selectors.js';
import {
  formatDate
} from '../utils/utils';
import MetadataRow from '../components/MetadataRow';
import Link from '../components/common/Link';
import {createMetadataGrid} from '../utils/utils';
import StandardsGrid from '../components/StandardsGrid';
import {BROWSE_TERM_MAPPING} from '../constants/constants';
import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';
import {getSearchPath,capitalize,sortGrade} from '../utils/utils';
import {NO_DESCRIPTION} from '../constants/placeholders';

@Radium
class Metadata extends React.Component {
  render() {
    let {
      description,
      authors,
      level,
      tagTerms,
      searchTerms,
      subject,
      tag,
      grade,
      state,
      createdTime,
      updatedTime,
      isSection,
      objectives,
      vocabulary,
      domain
    } = this.props;
    let rolesMetaData = this.getRolesMetaData(authors);

    //Description
    let metadataRows = [
      <MetadataRow key='description' data={[
          {header:'Description',
          content: description || NO_DESCRIPTION}]} />
    ];

    //Difficulty Level when available
    level && metadataRows.push([
        <MetadataRow key='level' data={[
          {header:'Difficulty Level',
          content: level}]} />
      ]);

    //Authors
    metadataRows.push([...rolesMetaData]);

    //Tags and Subjects when available
    let tagSubjectData = [];
    if(!isEmpty(tagTerms) || !isEmpty(tag)){
      let content = isEmpty(tagTerms)? tag: tagTerms;
      content.sort((a,b)=>{
        return a.toLowerCase() > b.toLowerCase();
      });
      tagSubjectData.push(
        {header:'Tags', content, ContentComponent:createMetadataGrid('tag') }
      );
    }

    !isEmpty(subject) &&
      tagSubjectData.push(
        {header:'Subjects', content: subject , ContentComponent:createMetadataGrid('subject')}
      );

    !isEmpty(tagSubjectData) &&
      metadataRows.push([
        <MetadataRow key='tags-and-subjects' data={tagSubjectData}/>
      ]);

    grade = sortGrade(grade);
    //Grade when available
    let gradeStandardData = [];
    !isEmpty(grade) &&
      gradeStandardData.push(
        {header:'Grades', content: grade,  ContentComponent:createMetadataGrid('grade')}
      );

    //Standards Correlations
    gradeStandardData.push(
      {header:'Standards Correlations', content: state, float: 'none', ContentComponent: StandardsGrid }
    );

    metadataRows.push([
      <MetadataRow key='grades-and-standards' data={gradeStandardData} />
    ]);

    //Search Keywords when available
    !isEmpty(searchTerms) &&
      metadataRows.push([
        <MetadataRow key='search' data={[
          {header:'Search Keywords', content:searchTerms, ContentComponent:createMetadataGrid('') }]} />,
      ]);

    //Date Created and Last Modified
    metadataRows.push([
      <MetadataRow key='created-and-modified' data={[
          {header:'Date Created', content: formatDate(createdTime)},
          {header:'Last Modified', content: formatDate(updatedTime)}]} />
    ]);

    if (isSection){
      if (objectives){
        metadataRows.splice(1,0,<MetadataRow key='objectives' data={[
            {header:'Objectives',
            contentXHTML: objectives}]} />);
      }
      if(!isEmpty(domain)){
        let {name, encodedID} = domain;
        metadataRows.splice(5,0, <MetadataRow key='' data={[
          {
            header: 'Concept Nodes',
            content:
            <Link
              href={getSearchPath(name, 'domain')}>
              {`${encodedID} (${name})`}
            </Link>
          }
        ]}/>);
      }
      if (vocabulary){
        metadataRows.push(<MetadataRow key='vocabulary' data={[
            {header:'Vocabulary',
            contentXHTML: vocabulary}]} />);
      }
    }
    return (
      <div className='metadata' style={styles.containerStyles}>
        {metadataRows}
      </div>
    );
  }
  getRolesMetaData(authors){
    let groupedRoles = groupBy(authors, (author) => author.role.name),
    groupedRolesKeys = Object.keys(groupedRoles);
    let rolesMetaData = groupedRolesKeys.map((key) => {
      let groupedRole = groupedRoles[key],
      names = groupedRole.map((role)=> role.name);
      return   <MetadataRow key={key} data={[
            {header:key,
            content: names, ContentComponent:createMetadataGrid(key)}]} />
    });
    return rolesMetaData;
  }
}

const mapStateToProps = (state) => {
  let artifact = getCurrentSectionArtifact(state),
    artifactType = artifact.type.name,
    isSection = (artifactType === 'lesson' || artifactType === 'section'),
    {description, createdTime, updatedTime, tagTerms=[], searchTerms=[]} = artifact,
    authors = getAuthors(state),
    browseTerms = getCurrentSectionMetadata(state);
  let terms =  {state: [], grade: [], subject: [], tag: []};
    tagTerms = tagTerms.map((tagTerm)=>tagTerm.name);
    searchTerms = searchTerms.map((searchTerm)=>searchTerm.name);
  let filtered = browseTerms.filter((item)=> Object.keys(BROWSE_TERM_MAPPING).indexOf(item.type.name)!=-1);
    filtered.forEach((item)=>{
      terms[BROWSE_TERM_MAPPING[item.type.name]].push(item.name);
    });
  let level = capitalize(getLevel(state)),
    {objectives, vocabulary} = getProcessedSectionContents(state),
    {domain} = getDomainNode(state);

  return {
    authors,
    description,
    createdTime,
    updatedTime,
    tagTerms,
    searchTerms,
    level,
    isSection,
    ...terms,
    objectives,
    vocabulary,
    domain
  };
};


const mapDispatchToProps = (dispatch) => ({
  dispatch
});

const styles = {
  containerStyles: {
    padding: '0px 10% 60px',
    '@media screen and (max-width: 768px)':{
      padding: 0
    }
  }
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Metadata);
