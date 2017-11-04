class History {
  constructor(){
    this.historyRef = null;
  }
  setHistory(ref){
    this.historyRef = ref;
  }
  getHistory(){
    return this.historyRef;
  }
}

if( !History.instance){
  History.instance =  new History();
}

export const setHistory = ref=>{
  History.instance.setHistory(ref);
};

export const getHistory = ()=>{
  return History.instance.getHistory();
};
