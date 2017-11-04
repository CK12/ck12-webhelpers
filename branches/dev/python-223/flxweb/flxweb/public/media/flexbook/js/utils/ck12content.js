
const regex_concept_template = /<!-- Begin inserted XHTML \[CONCEPT: \d+\] --> (.*) <!-- End inserted XHTML \[CONCEPT: \d+\] -->/g;
const regex_extract_body = /<body>([\s\S]*)<\/body>/;


const selector_mathjax = '.x-ck12-mathEditor, .x-ck12-math, .x-ck12-hwpmath, .x-ck12-block-math';
const selector_lesson_objectives = '.x-ck12-data-objectives';
const selector_lesson_vocabulary = '.x-ck12-data-vocabulary';

export const processLessonContent = (xhtml) => {
  let match1 = regex_concept_template.exec(xhtml);
  let match2 = regex_extract_body.exec(xhtml);

  let result = {
    conceptContent: xhtml || '',
    vocabulary: '',
    objectives: ''
  };
  if (match1) {
    result.conceptContent = match1[1];
  }
  if (match2) {
    let tmp = document.createElement('div');
    tmp.innerHTML = match2[1];
    result.objectives = tmp.querySelector(selector_lesson_objectives).innerHTML;
    result.vocabulary = tmp.querySelector(selector_lesson_vocabulary).innerHTML;
  }
  return result;
};

export const processChapterContent = (xhtml) => {
  let match = regex_extract_body.exec(xhtml);
  let result = {
    intro: '',
    summary: ''
  };
  if (match) {
    let content = match[1];
    let tmp = document.createElement('div');
    tmp.innerHTML = content;
    let nodes = tmp.querySelectorAll('.x-ck12-data');
    if(nodes[0].innerHTML.trim()!='')
    {
      result.intro = nodes[0].innerHTML + '<h2>Chapter Outline</h2>';
    }
    if(nodes[1].innerHTML.trim()!='')
    {
      result.summary = '<h2 style="border-top: 1px solid #e6e6e6;padding-top: 15px;margin: 2em 0 .4em;">Chapter Summary</h2>' 
                        + nodes[1].innerHTML;
    }
  }

  return result;
};

export const processAltContent = (xhtml) => {
  let tmp = document.createElement('div');
  tmp.innerHTML = xhtml;
  let nodes =  Array.prototype.slice.call(tmp.querySelectorAll(selector_mathjax));
  nodes.forEach((node) => {
    let alt = node.getAttribute('alt');
    if (alt !== null){
      node.setAttribute('alt', alt.replace(/</g,'\\lt ').replace(/>/g,'\\gt '));
    }
  });
  return tmp.innerHTML;
}

export const processMathJaxContent = (_callback) => {
  let nodes =  document.getElementsByClassName('x-ck12-mathEditor');
  for(let i=0;i<nodes.length;i++){
    try {
      let node = nodes[i],
      mathLatex, decodedTex;
      if(node.getElementsByClassName('MathJax').length==0 || node.getElementsByClassName('MathJax_Processing').length>0)
      {
        decodedTex = decodeURIComponent( node.getAttribute('data-tex') );
        if (decodedTex.indexOf('\\begin{align') === -1) {
          mathLatex = '\\begin{align*}' + decodedTex + '\\end{align*}';
        } else {
          mathLatex = decodedTex;
        }
        mathLatex = ('@$' + mathLatex + '@$').replace(/</g, '&lt;');
        node.innerHTML = mathLatex;
        node.removeAttribute('data-tex-mathjax');
        _callback();
      }
    } catch (err) {
      console.log('error processing math element...');
    }
  };
};
