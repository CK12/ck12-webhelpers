import React , {Component} from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import {LoaderContainer} from 'components';
import styles from 'scss/components/BooksContainer';

class BooksContainer extends Component{
	constructor(props){
		super(props)
	}
	componentDidUpdate(){
		this.bindEvents();
	}
	componentDidMount(){
		this.bindEvents();
	}
	trim(x) {
	    return x.replace(/^\s+|\s+$/gm,'');
	}
	bindEvents(){
		const {onClickOnStandard } = this.props;
		const $standardLink = $(this.refs.container.getElementsByClassName("std_links"));
		$standardLink.off("click").on("click",onClickOnStandard)
		
		const $bookTitle = $(this.refs.container.getElementsByClassName("heading-standardBoardLinks"));
		$bookTitle.off("click").on("click",function(){
			let el = this.parentElement.querySelector("a");
				location.href = el.getAttribute("href");
		})
	}
	render(){
		const {data,loaderDisplay,containerDisplay } = this.props;
		let hide = containerDisplay ? "" : "hide";
		let errorClass = /There are no books/.test(data)? styles.errorClass : '';
		return(
				<div className={`${styles.booksWrapper}`}>
					<div className={`${styles.booksContainer}  ${hide} ${errorClass}`} ref="container" dangerouslySetInnerHTML={{__html: this.trim(data)}}></div>
					<Placeholder data={data} loaderDisplay={loaderDisplay}/>
					<LoaderContainer label={`please wait...`} display={loaderDisplay}/>
				</div>
		)
	}
}
const Placeholder = (props) => {
	const {data,loaderDisplay} = props;
	let hide = (data !=="" || loaderDisplay)? "hide" : "";
	return(
			<div className={`${styles.placeholder} ${hide} column small-12 align-self-middle`}>
				<h4>Free Online Textbooks, Math & Science Lesson Plans!</h4>
				<div>Please select filters to get Math and Science FlexBooks&reg;</div>
			</div>
	)
}
export default BooksContainer;