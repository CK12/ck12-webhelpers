import React from 'react';

const VocabularyRow = (props) => {
  let {term, definition} = props;
  return (
    <div className='vocabularyrow' style={styles.row}>
      <span
        style={styles.term}
        dangerouslySetInnerHTML={{__html: term}}
        />
      <span
        style={styles.definition}
        dangerouslySetInnerHTML={{__html: definition}}/>

    </div>
  );
};
const styles = {
  row: {
    borderTop: '1px solid #ddd',
    padding: '10px 0 10px 0'
  },
  term: {
    fontWeight: 'bold',
    display: 'inline-block',
    verticalAlign: 'top',
    width: '30%'
  },
  definition:{
    display: 'inline-block',
    width: '70%'
  }
};
export default VocabularyRow;
