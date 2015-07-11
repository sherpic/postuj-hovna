import React from 'react';
import EXIF from 'exif-js/exif-js';
import downscaleImage from '../js/downscale-image';

export default class ImgUploader extends React.Component {
	constructor(...props) {
		super(...props);
    this.state = {
      base64s: []
    };
	}
  onFilesSelected(evt) {
    console.log('onFilesSelected ev', this);

    var self = this;
    var files = evt.target.files; // FileList object

    // Loop through the FileList and render image files as thumbnails.
    for (var i = 0, f; f = files[i]; i++) {

      // Only process image files.
      if (!f.type.match('image.jpeg')) {
        this.setState({error: 'Unsupported file type selected, try some other picture'});
        continue;
      }

      var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
          var img = new Image();
          img.onload = function() {
            downscaleImage({
              img: img,
              maxHeight: 1500,
              maxWidth: 1500,
              done: function(data) {
                self.setState({
                  base64s: self.state.base64s.concat([data])
                });
                if (self.props.onImageRead) {
                  self.props.onImageRead(data);
                }
              }
            });
          };

          img.src = e.target.result;
          self.getGPS(img);
        };
      })(f);

      // Read in the image file as a data URL.
      reader.readAsDataURL(f);
    }
  }
  getGPS(imgBase64) {
    //thanks to http://blogs.microsoft.co.il/ranw/2015/01/07/reading-gps-data-using-exif-js/
    var self = this;
    var toDecimal = function(number) {
      return number[0].numerator + number[1].numerator /
        (60 * number[1].denominator) + number[2].numerator / (3600 * number[2].denominator);
    };

    EXIF.getData(imgBase64, function() {
      var pos = {
        lng: EXIF.getTag(this, "GPSLongitude"),
        lat: EXIF.getTag(this, "GPSLatitude")
      };
      if (Array.isArray(pos.lng) && Array.isArray(pos.lat)) {
        pos.lat = toDecimal(pos.lat);
        pos.lng = toDecimal(pos.lng);

        if (self.props.onGPSRead) {
          self.props.onGPSRead(pos);
        }
      }
      console.log("was taken on " + pos.lat + " " + pos.lng);
    });
  }
  clickInput(ev){
    this.el = $(ev.target.parentElement);
    this.el.find('input').click();
  }
  isReadyToAdd(){
    return this.state.base64s.length > 0 && this.state.loc;
  }
	render() {
    let error = <span className="error">{this.state.error}</span>;
    let imagesOrInput;
    if (this.state.base64s.length > 0) {
      imagesOrInput = this.state.base64s.map((data) => {
        return <img src={data} style={{width: '100%'}}/>;
      });
    } else {
      imagesOrInput = <div>
        <img src={this.props.icon} className="big-icon img-responsive" width="160px"/>
        <span className="glyphicon glyphicon-camera clickable" onClick={this.clickInput.bind(this)}/>
        <input className="glyphicon glyphicon-camera" ref="input" type="file" accept="image/*;capture=camera" name="images"
               onChange={this.onFilesSelected.bind(this)} multiple/>
      </div>;
    }
		return <div className="post item">
      {imagesOrInput}
      {error}
    </div>;
	}
}