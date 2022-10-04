import React from "react";
// plugin that creates slider
import Slider from "nouislider";

class Sliders extends React.Component {    
  componentDidMount() {
    var slider1 = this.refs.slider1;
    Slider.create(slider1, {
      start: [40],
      connect: [true, false],
      step: 1,
      range: { min: 0, max: 100 }
    });
    
  }
  render() {
    return (
      <>
        <div className="slider" ref="slider1" />
      </>
    );
  }
}

export default Sliders;