// import React from 'react';
// import {connect} from 'react-redux';
// import Modal from 'react-modal';
// import EditableText from './common/EditableText';
// import Link from './common/Link';
// import Header from './common/Header';
// import Input from './common/Input';
// import Icon from './common/Icon';
// import Button from './common/Button';
// import Image from './common/Image';
// import Spinner from './common/Spinner';
// import Separator from './common/Separator';
// import * as InputTypes from '../constants/inputTypes';
// import {fetchGroups} from '../actions/groups';
// import {getClasses, areGroupsLoaded} from '../selectors/selectors';
// import isEmpty from 'lodash/isEmpty';
// import Radium from 'radium';
//
// @Radium
// class AssignToClass extends React.Component {
//   constructor(){
//     super();
//     this.state = {
//       isOpen: true,
//       selectedClasses: []
//     };
//   }
//   closeModal () {
//     this.setState({
//       isOpen: false
//     });
//     this.props.onClose();
//   }
//
//   componentDidMount(){
//     this.props.fetchGroups();
//   }
//
//   render() {
//     let {classes} = this.props,
//     {selectedClasses} = this.state;
//     let classRows = classes.map((c, index)=>{
//       let checked = selectedClasses.indexOf(index)!=-1;
//       return (
//         <div>
//           <input type='checkbox' value={index} checked={checked} onChange={()=>this.toggleClass({id: index, checked})} style={styles.checkbox}/>
//           <span style={styles.class}>{c.name}</span>
//           <div style={styles.date}>
//             <Input/>
//           </div>
//           <Separator spaced={false}/>
//         </div>
//       );
//     });
//     return (
//       <div className='assigntoclass'>
//         <Modal
//           style = {styles.modal}
//           isOpen={this.state.isOpen}>
//           <div onClick={()=>this.closeModal()} style={styles.close}> ✕ </div>
//           <Icon name='grps_assgnmts' color='#00ABA4' size='large' style={styles.assignIcon}/>
//           <Header size='header4' style={styles.header}>Assign to Class</Header>
//           <EditableText width='full' label='title' type={InputTypes.SINGLE_LINE_INPUT} text='Scientific Explanations and Interpretations' style={{value: styles.title}}/>
//           <EditableText label='instructions' type={InputTypes.MULTIPLE_LINE_INPUT}/>
//           <Separator/>
//           <div>
//             <input type='checkbox' onChange={()=>{this.toggleClasses();}} style={styles.checkbox}/>
//             <span style={styles.class}>Select all</span>
//             <span style={[styles.class,styles.dueDate]}>
//               <Icon name='Info' style={styles.infoIcon}/>
//               <span>due date</span>
//             </span>
//           </div>
//           <Separator spaced={false}/>
//           <div ref='classes'>
//             {this.props.loaded? classRows: <Spinner/>}
//           </div>
//           <div style={{textAlign: 'center'}}>
//             <Button color={isEmpty(selectedClasses)?'disabled':'tangerine'}>Assign to Class(es)</Button>
//           </div>
//         </Modal>
//       </div>
//     );
//   }
//
//   toggleClasses(){
//     let {selectedClasses} = this.state;
//     let {classes} = this.props;
//     if(isEmpty(selectedClasses))
//     this.setState({selectedClasses: classes.map((c, index)=> index)});
//     else
//     this.setState({selectedClasses: []});
//
//   }
//
//   toggleClass({id, checked}){
//     let {selectedClasses} = this.state,
//     array = Array.prototype.slice.call(selectedClasses, 0);
//     let pos = array.indexOf(id);
//     checked ?array.splice(pos, 1): array.push(id);
//     this.setState({
//       selectedClasses: array
//     });
//   }
// }
//
// const mapStateToProps = (state) => {
//   let loaded = areGroupsLoaded(state);
//   let classes = getClasses(state);
//   return {
//     classes,
//     loaded
//   };
// };
//
// const styles = {
//   close: {
//     width: 30,
//     height: 30,
//     color: '#fff',
//     backgroundColor: '#666',
//     position: 'absolute',
//     top: -10,
//     right: -10,
//     borderRadius: '50%',
//     fontSize: 24,
//     textAlign: 'center',
//     cursor: 'pointer'
//   },
//   assignIcon: {
//     marginRight: 4
//   },
//   infoIcon:{
//     marginRight: 10
//   },
//   header: {
//     marginBottom: 25
//   },
//   title: {
//     color: '#FF6C3D'
//   },
//   modal: {
//     overlay: {
//       zIndex: '100'
//     },
//     content: {
//       margin: '0 auto',
//       width: 550,
//       padding: 30,
//       overflow: 'inherit',
//       height: 470
//     }
//   },
//   checkbox: {
//     border: '2px solid #ccc',
//     borderRadius: 3,
//     width: 20,
//     height: 20,
//     cursor: 'pointer',
//     margin: '0 10px 0 0 '
//   },
//   dueDate:{
//     textTransform: 'uppercase',
//     float: 'right',
//     color: '#A9A497'
//   },
//   class: {
//     fontWeight: 'bold',
//     fontSize: 12,
//     color: '#A9A497',
//     verticalAlign: 'super'
//   },
//   date: {
//     float: 'right',
//     width: '33%',
//     marginBottom: 6
//   }
// };
// export default connect(
//   mapStateToProps,
//   {
//     fetchGroups
//   }
// )(AssignToClass);
