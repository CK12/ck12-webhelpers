import React from 'react';
import {connect} from 'react-redux';
import VocabularyRow from '../components/VocabularyRow';
import Header from '../components/common/Header';
import Select from '../components/common/Select';
import {getVocabularies, getVocabularyLanguage} from '../selectors/selectors';
import {changeVocabularyLanguage} from '../actions/actions';
import isEmpty from 'lodash/isEmpty';

class Vocabularies extends React.Component {
  render(){
    let {vocabularies, languages, language, changeVocabularyLanguage} = this.props;
    languages = languages.map((l)=>({label: l,value: l.toLowerCase()}));
    if(isEmpty(vocabularies))
      return false;
    let vocabularyRows = vocabularies.map((v, index)=>
      <VocabularyRow
        key={`vocabulary${index}`}
        term={v.term}
        definition={v.definition}/
      >);
    return (
      <div className='vocabularies'>
        <Header size='header3'>Vocabulary</Header>
        <Select style={styles.select} value={language} options={languages} onChange={changeVocabularyLanguage}/>
        <div style={styles.table}>
          <span style={styles.term}>term</span>
          <span style={styles.definition}>definition</span>
        </div>
        {vocabularyRows}
    </div>
    );
  }
}

const filterByLanguage = (options) => {
  let {language, vocabularies} = options;
  return vocabularies.filter((v)=>v.language.name.toLowerCase()==language) || [];
};

const getLanguages = ({vocabularies}) => {
  let languages = [];
  vocabularies.forEach((v)=>{
    let {language: {name}} = v;
    if(languages.indexOf(name) < 0)
      languages.push(name);
  });
  return languages;
};

const styles = {
  table: {
    marginTop: 10
  },
  term: {
    display: 'inline-block',
    fontWeight: 'bold',
    textTransform: 'capitalize',
    width: '30%'
  },
  definition:{
    display: 'inline-block',
    fontWeight: 'bold',
    textTransform: 'capitalize',
    width: '70%'
  },
  select: {
    float: 'right',
    width: 100
  }
};

const mapStateToProps = (state) => {
  let language = getVocabularyLanguage(state);
  let vocabularies = getVocabularies(state);
  let languages = getLanguages({vocabularies});
  vocabularies = filterByLanguage({vocabularies, language});
  return {
    languages,
    vocabularies,
    language
  };
};

const mapDispatchToProps = (dispatch) =>({
  changeVocabularyLanguage(language){ dispatch(changeVocabularyLanguage(language)); }
});



export default connect(
  mapStateToProps,
  {
    changeVocabularyLanguage
  }
)(Vocabularies);
