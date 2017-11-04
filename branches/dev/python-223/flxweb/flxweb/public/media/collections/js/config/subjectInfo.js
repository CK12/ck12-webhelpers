//TODO: create a npm module out of this.

const flxwebProps = (props) => {
  let defaultProps = {
    simsURL :null,
    plixURL :null,
    studyguideURL : null,
    cbseURL : null,
    showOnLandingPage : true,
    showOnSubjectBrowsePage : true,
    showSubjectsFilter: false,
    showDifficultyFilter: false,
    showHSMSTabs: false,
    showCLink: true,
    conceptMapURL : null
  };
  return {
    ...defaultProps,
    ...props
  };
};

var host = "https://interactives.ck12.org"
if (window.location.host == 'gamma.ck12.org') 
  host = "https://simtest.ck12.org"
//TODO: make urls protocol agnostic
//TODO: use constants for url prefixes
const flxwebSubjectInfo = {
  math: {
   branches:{ 
      'elementary-math': flxwebProps({showOnSubjectBrowsePage:false, showCLink:false}),
      'elementary-math-grade-1': flxwebProps({showOnLandingPage:false, showCLink:false}),
      'elementary-math-grade-2': flxwebProps({showOnLandingPage:false, showCLink:false}),
      'elementary-math-grade-3': flxwebProps({showOnLandingPage:false, showCLink:false}),
      'elementary-math-grade-4': flxwebProps({showOnLandingPage:false, showCLink:false}),
      'elementary-math-grade-5': flxwebProps({showOnLandingPage:false, showCLink:false}),
      'arithmetic': flxwebProps({
        plixURL: host + '/plix/arithmetic/index.html?subject=arithmetic',
        conceptMapURL: '/conceptmap/?subject=arithmetic'
      }),
      'measurement': flxwebProps({
        plixURL: host + '/plix/measurement/index.html?subject=measurement',
        conceptMapURL: '/conceptmap/?subject=measurement'
      }),
      'algebra': flxwebProps({
        plixURL: host + '/plix/algebra/index.html?subject=algebra',
        studyguideURL: '/study-guides/algebra/',
        cbseURL: '/cbse/?subject=Maths',
        conceptMapURL: '/conceptmap/?subject=algebra'
      }),
      'geometry': flxwebProps({
        plixURL: host + '/plix/geometry/index.html?subject=geometry',
        studyguideURL: '/study-guides/geometry/',
        cbseURL: '/cbse/?subject=Maths',
        conceptMapURL: '/conceptmap/?subject=geometry'
      }),
      'probability': flxwebProps({
        plixURL: host + '/plix/probability/index.html?subject=probability',
        cbseURL: '/cbse/?subject=Maths',
        conceptMapURL: '/conceptmap/?subject=probability'
      }),
      'statistics': flxwebProps({
        plixURL: host + '/plix/statistics/index.html?subject=statistics',
        cbseURL: '/cbse/?subject=Maths',
        conceptMapURL: '/conceptmap/?subject=statistics'
      }),
      'trigonometry': flxwebProps({
        plixURL: host + '/plix/trigonometry/index.html?subject=trigonometry',
        cbseURL: '/cbse/?subject=Maths',
        conceptMapURL: '/conceptmap/?subject=trigonometry'
      }),
      'analysis': flxwebProps({
        plixURL: host + '/plix/analysis/index.html?subject=analysis',
        cbseURL: '/cbse/?subject=Maths'
      }),
      'calculus': flxwebProps({
        plixURL: host + '/plix/calculus/index.html?subject=calculus',
        cbseURL: '/cbse/?subject=Maths',
        conceptMapURL: '/conceptmap/?subject=calculus'
      }),
   }
  },
  science: {
    branches: {
      'elementary-science': flxwebProps({showCLink:false}),
      'earth-science': flxwebProps({
        plixURL: host + '/plix/earth-science/index.html?subject=earth-science',
        studyguideURL: '/study-guides/earth-science/',
        conceptMapURL: '/conceptmap/?subject=earth-science'
      }),
      'life-science': flxwebProps({
        plixURL: host + '/plix/life-science/index.html?subject=life-science',
        conceptMapURL: '/conceptmap/?subject=life-science'
      }),
      'physical-science': flxwebProps({
        plixURL: host + '/plix/physical-science/index.html?subject=physical-science',
        conceptMapURL: '/conceptmap/?subject=physical-science'
      }),
      'biology': flxwebProps({
        plixURL: host + '/plix/biology/index.html?subject=biology',
        studyguideURL: '/study-guides/biology/',
        cbseURL: '/cbse/?subject=Biology',
        conceptMapURL: '/conceptmap/?subject=biology'
      }),
      'chemistry': flxwebProps({
        simsURL: host + '/simulations/chemistry.html?referrer=browse&backUrl=https://www.ck12.org/chemistry/',
        plixURL: host + '/plix/chemistry/index.html?subject=chemistry&referrer=browse&backUrl=https://www.ck12.org/chemistry/',
        cbseURL: '/cbse/?subject=Chemistry',
        conceptMapURL: '/conceptmap/?subject=chemistry'
      }),
      'physics': flxwebProps({
        simsURL: host + '/simulations/physics.html?referrer=browse&backUrl=https://www.ck12.org/physics/',
        plixURL: host + '/plix/physics/index.html?subject=physics&referrer=browse&backUrl=https://www.ck12.org/physics/',
        studyguideURL: '/study-guides/physics/',
        cbseURL: '/cbse/?subject=Physics',
        conceptMapURL: '/conceptmap/?subject=physics'
      })
    }
  },
  english: {
    branches: {
      'writing': flxwebProps({}),
      'spelling': flxwebProps({})
    }
  },
  more: {
    branches: {
      'engineering': flxwebProps({}),
      'technology': flxwebProps({}),
      'astronomy': flxwebProps({}),
      'history': flxwebProps({}),
      'health': flxwebProps({})
    }
  }
};

export default flxwebSubjectInfo;
