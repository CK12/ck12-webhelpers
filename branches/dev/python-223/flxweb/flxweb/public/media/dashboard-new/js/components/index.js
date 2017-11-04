// Navigation
import { default as ControlCenterMenu} from 'components/ControlCenterMenu';

// Groups Page
import { default as GroupsCards} from 'components/pages/groups/GroupsCards';

// Decorational or Formatting
import { default as Masthead} from 'components/Masthead';
import { default as List} from 'components/List';

// User Components
import { default as UserLocation} from 'components/UserLocation';
import { default as UserMenu} from 'components/UserMenu';
import { default as UserName} from 'components/UserName';
import { default as UserPhoto} from 'components/UserPhoto';
import { default as UserSubjects} from 'components/UserSubjects';

import { default as MessageBox } from 'components/MessageBox';
import { default as Modal } from 'components/Modal';
import { default as Loader } from 'components/Loader';
import { default as LoaderContainer } from 'components/common/LoaderContainer';
import { default as SubjectsPicker } from 'components/SubjectsPicker';
import { default as GradesPicker } from 'components/GradesPicker';

// CommonJS syntax needed to avoid components being read-only for hot reloading
module.exports = {
    ControlCenterMenu,

    GroupsCards,

    Masthead,
    List,

    UserLocation,
    UserMenu,
    UserName,
    UserPhoto,
    UserSubjects,

    MessageBox,
    Modal,
    Loader,
    LoaderContainer,
    SubjectsPicker,
    GradesPicker
};