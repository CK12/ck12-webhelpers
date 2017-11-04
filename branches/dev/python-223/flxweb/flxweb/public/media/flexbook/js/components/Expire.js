import React, {Component} from 'react';

export default class Expire extends Component{
  constructor(){
    super();
    this.state = {
      visible: true
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.children !== this.props.children) {
      this.setTimer();
      this.setState({visible: true});
    }
  }
  componentDidMount(){
    this.setTimer();
  }

  setTimer() {
    this._timer != null ? clearTimeout(this._timer) : null;
    // hide after `delay` milliseconds
    this._timer = setTimeout(function(){
      this.setState({visible: false});
      this._timer = null;
    }.bind(this), this.props.delay);
  }

  componentWillUnmount() {
    clearTimeout(this._timer);
  }

  render(){
    return this.state.visible ? <div>{this.props.children}</div>: <span />;
  }
}

Expire.defaultProps = {
  delay: 1000
};
