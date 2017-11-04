import AuthAPI from './AuthAPI';
import Routing from './Routing';
import StandardsAPI from './StandardsAPI';
import StandardsListMiddleware from './StandardsListMiddleware';
import PreRoutingValidator from './PreRoutingValidator';
import AlignedConceptAPI from './AlignedConceptAPI';
import ModalMiddleware from './ModalMiddleware';
import DownloadMiddleware from './DownloadMiddleware';


export default [ AuthAPI ,
                 Routing,
                 StandardsAPI,
                 StandardsListMiddleware,
                 PreRoutingValidator,
                 AlignedConceptAPI,
                 ModalMiddleware,
                 DownloadMiddleware
                ];
