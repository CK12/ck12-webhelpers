var error = document.querySelector('.error');

module.exports = {
    window            :  window,
    modalityTitle     :  document.querySelector('.modality-title'),
    loader            :  document.querySelector('.loader'),
    content           :  document.querySelector('.content'),
    error             :  error,
    retry             :  error.querySelector('.retry'),
    'modality-types'  :  document.getElementById('modality-types'),
    templates: {
        modality: document.getElementById('item-template')
    }
};