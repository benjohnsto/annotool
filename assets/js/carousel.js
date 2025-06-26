  var app = {
    'viewer':{},
    'slides':[]
  
  }


	    /**************************
	     * initialize OSD
	     ********************/
	    app.viewer = OpenSeadragon({
	        id: "viewer",
	        prefixUrl: "assets/js/openseadragon/images/",
	        tileSources: [],
	        showFullPageControl: false,
	        showRotationControl: true,
	        minZoomLevel: 0.1,
	        defaultZoomLevel: 0.5,
	        preserveImageSizeOnResize: true,
	        sequenceMode: true,
	        showReferenceStrip: true
	    });
	    
	    
	    
	    //app.viewer.open("https://iiif-cloud.princeton.edu/iiif/2/24%2F61%2Ffd%2F2461fd191da44f098c94090f4207c6f5%2Fintermediate_file/info.json");
	    
	    
	    


var data = getQueryVariable("data");
if((data.length) % 4 == 0) {
  var m1 = atob(data);
  var m2 = decodeURIComponent(m1);
}
else {
  console.log((data.length) % 4, data.length);
  console.log('not mod 4');
}

var json = JSON.parse(m2);

json.items.forEach((item)=>{
   var manifest = item.target.partOf.id;
   var canvas = item.target.id;
   
   fetch(manifest).then(response => {
	  if (!response.ok) {
	      throw new Error(response.statusText);
	  }
	  return response.json();
   })
   .then(manifest => {
	  var m = new IIIFConverter();
	  m.load(manifest);
          m.items.forEach((bitem)=>{
            if(bitem.id == canvas) { 
              app.slides.push( {type:'image',url: bitem.service+"/full/full/0/default.jpg"});
              return bitem.service+"/full/full/0/default.jpg";
            }
          });
          	       
   }).then(image => {
   console.log(app.slides);  
   app.viewer.open(app.slides); 
   });
   
	    

});    



function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  } 
  alert('Query Variable ' + variable + ' not found');
}



