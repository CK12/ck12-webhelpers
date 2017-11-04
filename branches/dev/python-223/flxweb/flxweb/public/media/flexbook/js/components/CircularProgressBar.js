import React, {Component} from 'react';
import Radium from 'radium';

@Radium
export default class ProgressBar extends Component{
  componentDidMount(){
    let canvas = this.refs.canvas,
      {color} = this.props,
      ctx = canvas.getContext('2d'),
      c = 2*Math.PI,
      s = 0.5*Math.PI;
    canvas.width = 100;
    canvas.height = 100;
    let {progress,borderColor} = this.props;

    ctx.beginPath();
    ctx.arc(50, 50, 38, 0 - s,  c - s, false);
    ctx.strokeStyle= borderColor? borderColor:'#FFFFFF'; 
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(50, 50, 38, 0 - s,  progress * c - s, false);
    ctx.lineWidth = 6;
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  render(){
    let {style} = this.props;
    return <canvas className='circularprogressbar' style = {[styles.canvas, style]} ref='canvas'/>;
  }
}

const styles = {
  canvas: {
    position: 'absolute',
    left: 18,
    top: -4
  }
};
