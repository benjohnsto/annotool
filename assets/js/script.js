


	var app = {
	   'viewer': {},
	   'overlayOn': false,
	   'manifests': [],
	   'canvases':{},
	   'current':{},
	   'selections':[],
	   'annoPage':{
	     'id': 'thisistheid',
	     'type': 'AnnotationPage',
	     'items': []
	   }
	}

	var crop = {};



	function init() {




	    /**************************
	     * if there is a manifest url var, load it
	     *************************************************/
	    var vars = getURLValues();
	    if (typeof vars.manifest !== 'undefined') {
	        var url = vars.manifest;
	        jQuery("#url").val(url);
	        
	        load(url);
	    }



	    /**************************
	     * tooltip
	     *************************************************/

	    tippy('#copy', {
	        trigger: "click",
	        content: "Copied",
	        onShow(instance) {
	            setTimeout(() => {
	                instance.hide();
	            }, 2000);
	        }
	    });



	    /**************************
	     * adjust the height of the gallery to the size of the screen
	     *************************************************/
	    var h = jQuery(window).height();
	    jQuery("#viewer").css("height", h);
	    var e1 = jQuery(".url-element").height();
	    var e2 = jQuery(".output-element").height();

	    jQuery("#gallery").css("max-height", (h - 190));
	    jQuery(window).resize(function() {
	        jQuery("#viewer").css("height", jQuery(window).height());
	    });


	} // end init()







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
	        preserveImageSizeOnResize: true
	    });

	    app.viewer.addHandler('rotate', function() {
	        app.current.rotation = viewer.viewport.getRotation();

	        if (app.current.rotation < 0) {
	            app.current.rotation = 360 + app.current.rotation;
	        }
	        if (app.current.rotation == 360) {
	            app.current.rotation = 0;
	        }
	    });
	    
	    

	    /*************************** CROPPING **************************/


	    // draw overlays

	    new OpenSeadragon.MouseTracker({


	        element: app.viewer.element,
	        pressHandler: function(event) {


	            if (!app.selectionMode) {
	                return;
	            }

	            if (app.overlayOn) {
	                app.viewer.removeOverlay("overlay");
	            }
	            var overlayElement = document.createElement("div");
	            overlayElement.id = "overlay";
	            overlayElement.className = "highlight";

	            var viewportPos = app.viewer.viewport.pointFromPixel(event.position);
	            app.viewer.addOverlay({
	                element: overlayElement,
	                location: new OpenSeadragon.Rect(viewportPos.x, viewportPos.y, 0, 0)
	            });
	            app.overlayOn = true;
	            drag = {
	                overlayElement: overlayElement,
	                startPos: viewportPos
	            };


	        },
	        dragHandler: function(event) {

	            if (typeof drag === 'undefined') {
	                return;
	            }

	            var viewportPos = app.viewer.viewport.pointFromPixel(event.position);

	            var diffX = viewportPos.x - drag.startPos.x;
	            var diffY = viewportPos.y - drag.startPos.y;

	            var location = new OpenSeadragon.Rect(
	                Math.min(drag.startPos.x, drag.startPos.x + diffX),
	                Math.min(drag.startPos.y, drag.startPos.y + diffY),
	                Math.abs(diffX),
	                Math.abs(diffY)
	            );

	            var overlayHeight = jQuery("#overlay")[0].clientWidth;

	            var w = app.viewer.tileSources[0].width;
	            var h = app.viewer.tileSources[0].height;

	            region = [
	                Math.floor(location.x * w),
	                Math.floor(location.y * w),
	                Math.floor(location.width * w),
	                Math.floor(location.height * w)
	            ]
	           

	            // if the box goes outside the boundaries of the image

	                if (region[0] < 0) { region[0] = 0;  }
	                if (region[1] < 0) { region[1] = 0;  }
	                if (region[0]+region[2] > w) { region[2] = w - region[0]; }
	                if (region[1]+region[3] > h) { region[3] = h - region[1]; }


	            // update the box    
	            app.viewer.updateOverlay(drag.overlayElement, location);
	            
	            crop.overlay = location;
	            
		    // update current
		    crop.region = region.join(',');
		    
		    crop.large = crop.service + "/" + region.join(',') + "/1200,/" + crop.rotation + "/default.jpg";
		    crop.small = crop.service + "/" + region.join(',') + "/,300/" + crop.rotation + "/default.jpg";
		    crop.actual = crop.service + "/" + region.join(',') + "/"+overlayHeight+"/" + crop.rotation + "/default.jpg";
		    crop.html = "<img alt='detail' src='" + crop.small + "' data-manifest='" + crop.manifest + "'/>";

	            updateOutputURLs();
	        },
	        releaseHandler: function(event) {

	            if (app.selectionMode == true) {


	                //manifest_url = jQuery(".gallery-item-active").attr('data-manifest');

	                // add info to the selections array
	                // creating an id would probably be good
	                // app.selections[id] = app.outputs;
	                //var selection_index = app.selections.push(app.outputs)-1;


	                // if any items in the tray are currently active, remove active class
	                jQuery(".filmstrip-item.active-item").removeClass('active-item');



               // jQuery("#preview").addClass('shown').show();

	                // revert output mode back to actual
	                jQuery("#actual").prop("checked", true);
	                jQuery("#output").attr('data-mode', 'actual');

	                jQuery("#crop").removeClass("activated");

	                jQuery("#output").attr('data-mode', 'actual');
	                setMode('large');
	                updateOutputURLs();
             
	                
	                
	                
	            }

	            drag = null;

	        }
	    });



	/*************************
	 * activate or de-activate crop mode
	 ***********************************/

	jQuery('#crop').click(function() {


	    crop = JSON.parse(JSON.stringify(app.current));

	    if (jQuery("#crop").hasClass("activated")) {
	      disableCrop();
	    } else {   
	      enableCrop();
	    }


	});

	
	function enableCrop() {
	   jQuery("#crop").addClass("activated");
	   app.selectionMode = true;
	   app.viewer.setMouseNavEnabled(false);
	   if (app.overlayOn) {
	         app.viewer.removeOverlay("overlay");
	   }
	   app.overlayOn = true;
	}
	
	function disableCrop() {
	   jQuery("#crop").removeClass("activated");
	   app.selectionMode = false;
	   app.viewer.setMouseNavEnabled(true);
	   if (app.overlayOn) {
	      app.viewer.removeOverlay("overlay");
	   }	   
	   app.overlayOn = false;
	   crop = {};
	}


	jQuery(".export").click(function(e){
	  
	  var ap = new Annotation();
	  
	  console.log(app.selections);
	  
	  /*
	  var textualbody = jQuery("#textualbody").val();
	  var body = {"type":"TextualBody","value":textualbody,",purpose":"describing","format":"text/html"}
	  ap.addBody(body);
	  var tags = jQuery("#tags").val().split(',');
	  tags.each((tag)=>{
	    var body = {"type":"TextualBody","value":tag,",purpose":"tagging","format":"text/html"}
	    ap.addBody(body);
	  });
	  
	  
	  console.log(ap);
	  */	
	  e.preventDefault();
	});


       jQuery("#saveannotations").click(function(e){
         updateSlide();
         e.preventDefault();
       });


	/*************************
	 * add slide
	 ***********************************/

	jQuery('#addslide').click(function(e) {
         addSlide();
         e.preventDefault();
	});
	
	
	function updateSlide() {
	   var textualbody = jQuery("#textualbody").val();
	   var tags = jQuery("#tags").val().split(',').map(s => s.trim());
	   app.selections[id].textualbody = textualbody;
	   app.selections[id].tags = tags;	   
	}
	
	
	function addSlide() {
	   var id = makeid();
	   var textualbody = jQuery("#textualbody").val();
	   var tags = jQuery("#tags").val().split(',').map(s => s.trim());

	   if(!jQuery.isEmptyObject(crop) && crop.region.indexOf(',') > 0) {
	       app.selections[id] = crop;
	       app.selections[id].crop = true;
	   }
	   else { 
	       app.selections[id] = app.current;
	       app.selections[id].crop = false;	       
	   }

	   app.selections[id].textualbody = textualbody;
	   app.selections[id].tags = tags;

	   jQuery(".active-item").removeClass('active-item');
	   var alttext = "detail from " + app.manifests[app.current.manifest].label.replace("'","&apos;");
	   var mirador_link = "https://mcgrawcenter.github.io/mirador/?manifest=" + encodeURI(app.current.manifest) + "&canvas=" + app.current.canvas;


	   var slide = "<div id='" + id + "' class='filmstrip-item' data-type=''>\
		    <div><img alt='detail of "+app.selections[id].label+"' src='"+app.selections[id].small+"' data-manifest='"+app.selections[id].manifest+"'/></div>\
		    <div class='selectcrop copyable' style='position:absolute;top:0px;left:0px;z-index:-100'>\
		    <a href='" + app.selections[id].manifest + "' title='"+alttext+"' target='_blank'>\
		    <img alt='detail of "+app.selections[id].label+"' src='"+app.selections[id].small+"' data-manifest='"+app.selections[id].manifest+"'/>\
		    </a>\
		    </div>\
		    <span class='filmstrip-item-tools'>\
		     <a href='#' class='copyable'><img src='assets/images/copy.svg' class='icon-sm'/></a>\
		     <a href='#' class='filmstrip-item-metadata'><img src='assets/images/info-circle-white.svg' class='icon-sm'/></a>\
		     <a href='" + app.selections[id].actual + "' class='filmstrip-item-external' target='_blank'><img src='assets/images/external-white.svg' class='icon-sm'/></a>\
		     <a href='#' class='filmstrip-item-close'><img src='assets/images/x-white.svg' class='icon-sm'/></a></span></div>";


	    jQuery("#filmstrip-tray").prepend(slide);	
	    showFilmstrip();
	    updateOutputURLs();


	    disableCrop();
	}
	
	
	

	/******************************
	 *  The three output textarea modes
	 ********************************/

	jQuery(".setmode").click(function(e) {
	    var mode = jQuery(this).attr("data-mode");
	    setMode(mode);
	});




	/******************
	 * select a gallery item
	 ***********************************************************/

	jQuery(document).on("click", ".gallery-item", function(e) {


	    var manifest = jQuery(this).attr('data-manifest');
	    var canvas =   jQuery(this).attr('data-canvas');
	    
	    var o = app.canvases[canvas];
	    
	    //var alttext = app.manifests[app.current.manifest].label.replace("'","&apos;");
	    var alttext = o.label;
	    
            app.current = {
                "manifest": manifest,
                "canvas": canvas,
                "service": o.service,
                "version": o.version,
                "region": "full",
                "size": "full",
                "rotation": '0',
                "height": o.height,
                "width": o.width,   
                "large": o.service + "/full/1200,/0/default.jpg",
                "small": o.service + "/full/,300/0/default.jpg",
                "actual": o.service + "/full/full/0/default.jpg",
                "html": "<img alt='detail of "+alttext+"' src='"+ o.service + "/full/full/0/default.jpg' data-manifest='" + manifest + "'/>"
            }
               
	    if (o.version == 3) { app.current.size = "max"; }
	    
	    crop = app.current;

	    // highlight this gallery item
	    jQuery(".gallery-item").removeClass('gallery-item-active');
	    jQuery(this).addClass('gallery-item-active');

	    // un-hilight any tray thumbs that might be highlighted
	    jQuery(".filmstrip-item").removeClass('active-item');

	    jQuery("#crop").removeClass("activated");
	    app.selectionMode = false;
	    app.viewer.setMouseNavEnabled(true);


	    jQuery("#image").prop("checked", true);


	     app.viewer.open(app.current.service + "/info.json");
	

	    jQuery.get(app.current.service + "/info.json", function(data) {

	        app.viewer.open(data);
	        app.viewer.tileSources.unshift(data);

	        // find out if this is a v2 or v3 image server
	        // to determine whether we should use 'full' or 'max'
	        if (typeof data['@context'] != 'undefined') {
	            if (data['@context'] == 'http://iiif.io/api/image/3/context.json') {
	                app.current.version = 3;
	            } else {
	                app.current.version = 2;
	            }
	        } else {
	            app.current.version = 2;
	        }


	        // i had orignally populate the output textarea with the full url when one clicked on the gallery item
	        //if(app.max_or_full == 'max') { var full_size = app.current.service+"/full/max/0/default.jpg"; }
	        //else { var full_size = app.current.service+"/full/full/0/default.jpg"; }

	        var zoom = app.viewer.viewport.getZoom();
	        var width = app.viewer.tileSources[0].width;
	        var adjustedwidth = parseInt((width * zoom) * 0.18);
	        var actual_size = app.current.service + "/full/" + adjustedwidth + ",/0/default.jpg";


	        //app.current.rotation = 0;
	        //app.current.region = "full",
	        app.current.size = adjustedwidth + ",";

	        setMode('large');

	        updateOutputURLs();


	    });

	    app.mode = 'large';
	    e.preventDefault();
	});





	/******************
	 * click on a preview item in the tray
	 *************************************************/

	jQuery(document).on("click", ".filmstrip-item", function(e) {


	    
	    // highlight this gallery item
	    jQuery(".filmstrip-item").removeClass('active-item');
	    jQuery(this).addClass("active-item");

	    var id = jQuery(this).attr('id');
	    //app.current = app.selections[id];
	    
	    
	    // highlight corresponding canvas
	    jQuery(".gallery-item").removeClass('gallery-item-active');
	    

	    jQuery(".gallery-item[data-service='" + app.selections[id].service + "']").addClass('gallery-item-active');	    
	    
	    // load the viewer

	    if(app.selections[id].crop == true) { 

	       var tilesource = {
	   	  type: 'image',
		  url:  app.selections[id].large
	       }
	    console.log(tilesource);
	       app.viewer.open(tilesource);
	    }
	    else {
	       app.viewer.open(app.selections[id].service+"/info.json");
	    }

	    

/*
	    if(app.selections[id].region.indexOf(',') > 0) {

	            var overlayElement = document.createElement("div");
	            overlayElement.id = "overlay";
	            overlayElement.className = "highlight";
		    app.viewer.addOverlay(overlayElement,app.current.overlay)
	            app.overlayOn = true;	    
	    }	    
	    
*/	    
	    
            //re-populate the url text field with the manifest url for this detail
	    //var previous_manifest_url = jQuery("#url").val();

	    jQuery("#url").val(app.selections[id].manifest);

	    // if we are changing to a different manifest, reload the gallery of thumbs

/*
	    if (previous_manifest_url != app.selections[id].manifest) {
	        load(app.selections[id].manifest);
	    }
*/
	    //populate the output textarea with whatever mode is currently selected
	    //app.outputs = app.selections[id];
	    updateOutputURLs();

	});







	/************************************
	 * 
	 *********************************/

	function addToGallery(manifest, item) {
	
	
	    var html = "<div>";
	    html += "<p class='gallery-manifest-label'>" + item.label + "</p>";
	    html += "<ul>";
	    
	    
	    
	    jQuery.each(item.items, function(i, v) {

	        app.canvases[v.id] = v;
	    
	        if (v.service != 'error') {
	            html += "<li class='gallery-item' data-manifest='" + manifest + "' data-canvas='" + v.id + "' alt='image " + i + "'><img alt='" + v.label + "' src='" + v.service + "/full/,200/0/default.jpg'/><div class='gallery-item-label'>" + v.label + " </div></li>";
	        } else {
	            html += "<li class='gallery-item' data-manifest='" + v.manifest + "' data-canvas='" + v.canvas + "' alt='image " + i + "'><div class='gallery-item-label'>" + v.label + " </div></li>";
	        }
	    });	    
	    html += "</ul>";
	    html += "</div>";
	    
	    jQuery("#gallery").append(html);
	    
	}










