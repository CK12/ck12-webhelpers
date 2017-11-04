import ck12ajax from 'ck12-ajax';


export const fetchRetrolation = (id) =>{
    let url = '/flx/get/retrolation/' + id;
    return ck12ajax({
        url: url
    });
};

export const fetchFeaturedModalities = (handle) =>{
    let url = '/flx/get/featured/modalities/lesson,lecture,asmtpractice,enrichment,simulationint,simulation,PLIX/'+ handle +'?expirationAge=daily';
    return ck12ajax({
        url: url
    });
};
