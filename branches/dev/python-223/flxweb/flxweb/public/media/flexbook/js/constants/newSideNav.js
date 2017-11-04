export const ADD_TO_LIBRARY = 'Add to Library';
export const SHARE_TO_GROUPS = 'Share to Groups';
export const ADD_TO_FLEXBOOK_TEXTBOOK = 'Add to FlexBook® Textbook';
export const CUSTOMIZE = 'Customize';
export const CUSTOMIZE_TITLE_SECTIONS = 'Make a copy of this Modality';
export const QUICK_TIPS = 'QUICK_TIPS';

const sectionOptions = [{index: 1, label: ADD_TO_LIBRARY, title: ADD_TO_LIBRARY, icon: 'backpack'},{index: 2, label: SHARE_TO_GROUPS, title: SHARE_TO_GROUPS, icon:'groups'},{index: 3, label: ADD_TO_FLEXBOOK_TEXTBOOK, title: ADD_TO_FLEXBOOK_TEXTBOOK, icon: 'book'},
  {index: 4, label: CUSTOMIZE, title: CUSTOMIZE_TITLE_SECTIONS, icon:'settings_single'}, {index: 5, label: QUICK_TIPS, icon:{notes:'notes',vocabulary:'vocab',summary:'sigma',offline:'offline-reader'}}];

export const getNewNavOptions = () => {
  return sectionOptions;
};
