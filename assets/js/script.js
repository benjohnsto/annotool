


	var app = {
	   'viewer': {},
	   'manifests': [],
	   'canvases':{},
	   'current':{},
	   'outputs':{},
	   'selections':[],
	   'annoPage':{}
	}




	function init() {




	    /**************************
	     * if there is a manifest url var, load it
	     *************************************************/
	    var vars = getURLValues();
	    if (typeof vars.manifest !== 'undefined') {
	        var url = vars.manifest;
	        jQuery("#url").val(url);
	        //current.manifest = url;
	        
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
		console.log(app.current.rotation);
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

	            // get the outputs
	            
	            app.outputs = {
	                "id": makeid(),
	                "manifest": app.current.manifest,
	                "canvas": app.current.canvas,
	                "service": app.current.service,
	                "version": app.current.version,
	                "region": region.join(','),
	                "rotation": app.current.rotation,
	                "height": app.current.height,
	                "width": app.current.width,
	                "outputs": {	                
	                  "large": app.current.service + "/" + region.join(',') + "/1200,/" + app.current.rotation + "/default.jpg",
	                  "small": app.current.service + "/" + region.join(',') + "/,300/" + app.current.rotation + "/default.jpg",
	                  "actual": app.current.service + "/" + region.join(',') + "/" + overlayHeight + ",/" + app.current.rotation + "/default.jpg",
	                  "html": ""
	                }
	            }
	            if (app.current.version == 3) {
	                app.outputs.outputs.actual = app.current.service + "/" + region.join(',') + "/max/" + app.current.rotation + "/default.jpg";
	            } else {
	                app.outputs.outputs.actual = app.current.service + "/" + region.join(',') + "/full/" + app.current.rotation + "/default.jpg";
	            }
	            app.outputs.outputs.html = "<img alt='detail' src='" + app.outputs.outputs.small + "' data-manifest='" + app.current.manifest + "'/>";

	            updateOutputURLs();
	        },
	        releaseHandler: function(event) {

	            if (app.selectionMode == true) {

	                
	                app.selections[app.outputs.id] = app.outputs;
	                
	                /*
	                WHAT WE NEED
	                
			CANVASID
			CANVAS IMAGE WIDTH
			CANVAS IMAGE HEIGHT
			CANVAS IMAGE SERVICE
			CANVAS IMAGE SERVICE VERSION
			ANNOTATION TEXT
			ANNOTATION TAGS
			ANNOTATION REGION
			MANIFEST

			*/	                

			//console.log(app.current);
			//console.log(app.manifests[app.current.manifest]);
	                manifest_url = jQuery(".gallery-item-active").attr('data-manifest');

	                // add info to the selections array
	                // creating an id would probably be good
	                // app.selections[id] = app.outputs;
	                //var selection_index = app.selections.push(app.outputs)-1;


	                // if any items in the tray are currently active, remove active class
	                jQuery(".filmstrip-item.active-item").removeClass('active-item');


	                //construct html of thumbnail in bottom tray

	                var mirador_link = "https://mcgrawcenter.github.io/mirador/?manifest=" + encodeURI(manifest_url) + "&canvas=" + app.outputs.canvas;

	                



	                tippy('.copyable', {
	                    trigger: "click",
	                    content: "Copied",
	                    placement: "left",
	                    onShow(instance) {
	                        setTimeout(() => {
	                            instance.hide();
	                        }, 2000);
	                    }
	                });

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
	}
	
	function disableCrop() {

	   jQuery("#crop").removeClass("activated");
	   app.selectionMode = false;
	   app.viewer.setMouseNavEnabled(true);
	   if (app.overlayOn) {
	      app.viewer.removeOverlay("overlay");
	   }	   
	   
	}


	/*************************
	 * add slide
	 ***********************************/

	jQuery('#addslide').click(function() {

	
	   jQuery(".active-item").removeClass('active-item');
	   var alttext = "detail from " + app.manifests[app.current.manifest].label.replace("'","&apos;");

console.log(app.outputs);

	   var slide = "<div id='" + app.outputs.id + "' class='filmstrip-item active-item'>\
		    <div>" + app.outputs.outputs.html + "</div>\
		    <div class='selectcrop copyable' style='position:absolute;top:0px;left:0px;z-index:-100'>\
		    <a href='" + app.outputs.manifest + "' title='"+alttext+"' target='_blank'>" + app.outputs.outputs.html + "</a>\
		    </div>\
		    <span class='filmstrip-item-tools'>\
		     <a href='#' class='copyable'><img src='assets/images/copy.svg' class='icon-sm'/></a>\
		     <a href='#' class='filmstrip-item-metadata'><img src='assets/images/info-circle-white.svg' class='icon-sm'/></a>\
		     <a href='" + app.outputs.outputs.actual + "' class='filmstrip-item-external' target='_blank'><img src='assets/images/external-white.svg' class='icon-sm'/></a>\
		     <a href='#' class='filmstrip-item-close'><img src='assets/images/x-white.svg' class='icon-sm'/></a></span></div>";


	    jQuery("#filmstrip-tray").prepend(slide);	
	    showFilmstrip();
	   
/*	

we need width height label

canvas: "https://data.artmuseum.princeton.edu/iiif/objects/30445/canvas/30445-canvas-3274"
​manifest: "https://data.artmuseum.princeton.edu/iiif/objects/30445"
​region: "full"
​rotation: 0
​service: "https://media.artmuseum.princeton.edu/iiif/2/collection/y1967-24"
​size: "226,"
version: 2


	   var item = { 
	   "id": app.current.canvas,"type": "Canvas","height": 843,"width": 560,"label": {"en": ["Warhol"]},
           "thumbnail": [{"id": "https://media.artmuseum.princeton.edu/iiif/3/collection/x1986-209/full/280,/0/default.jpg","type": "Image","format": "image/jpeg","height": 421,"width": 280}],
           "items":[]
           }
*/           

	});

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
	

	

	    //app.current.canvas = jQuery(this).attr('data-canvas');
	    var manifest = jQuery(this).attr('data-manifest');
	    var canvas =   jQuery(this).attr('data-canvas');
	    
	    var o = app.canvases[canvas];
	    
	    app.current = {"manifest":manifest, "canvas": canvas, "service": o.service, "version":o.version, "width":o.width,"height":o.height}
	    	    
	    
	    
	    

	    // highlight this gallery item
	    jQuery(".gallery-item").removeClass('gallery-item-active');
	    jQuery(this).addClass('gallery-item-active');

	    // un-hilight any tray thumbs that might be highlighted
	    jQuery(".filmstrip-item").removeClass('active-item');

	    jQuery("#crop").removeClass("activated");
	    app.selectionMode = false;
	    app.viewer.setMouseNavEnabled(true);


	    jQuery("#image").prop("checked", true);

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


	        app.current.rotation = 0;
	        app.current.region = "full",
	            app.current.size = adjustedwidth + ",";


	        // update the urls that appear in the output textarea
       
	
            app.outputs = {
                "id": makeid(),
                "manifest": app.current.manifest,
                "canvas": app.current.canvas,
                "service": app.current.service,
                "version": app.current.version,
                "region": "full",
                "rotation": app.current.rotation,
                "height": app.current.height,
                "width": app.current.width,
                "outputs": {	                
                  "large": app.current.service + "/full/1200,/" + app.current.rotation + "/default.jpg",
                  "small": app.current.service + "/full/,300/" + app.current.rotation + "/default.jpg",
                  "actual": app.current.service + "/full/full/" + app.current.rotation + "/default.jpg",
                  "html": ""
                }
            }		        
	    if (app.current.version == 3) {
	            app.outputs.actual = app.current.service + "/full/max/0/default.jpg";
	    }

	    setMode('large');

	    var alttext = app.manifests[app.current.manifest].label.replace("'","&apos;");
	        
	    app.outputs.outputs.html = "<img alt='detail of "+alttext+"' src='" + app.outputs.outputs.actual + "' data-manifest='" + app.current.manifest + "'/>";
	        
	    updateOutputURLs();


	    });

	    app.mode = 'large';
	    e.preventDefault();
	});







	/*********************************
	 * ACTIONS
	 *******************************/

	// submit a url
	jQuery("#submit").click(function() {
	    var url = jQuery("#url").val();
	    app.current.manifest = url;
	    jQuery("#gallery").empty();
	    load(url);
	});
	
	
	
	/******************************
	 *  Set the mode
	 ********************************/
	function setMode(mode) {
	    jQuery("input[id='" + mode + "']").prop("checked", true);
	    jQuery("#output").attr("data-mode", mode);
	    updateOutputURLs();
	    jQuery(".filmstrip-item.active-item").find(".filmstrip-item-external").attr('href', app.outputs[mode]);
	}	




	/*************************
	 * show / hide preview bar
	 ***********************************/

	jQuery(".showfilmstrip").click(function() {
	    if (jQuery("#filmstrip").hasClass('shown')) {
	        hideFilmstrip();
	    } else {
	        showFilmstrip();
	    }
	});
	
	
	function showFilmstrip() {
	   jQuery("#filmstrip").addClass('shown');
	}
	
	function hideFilmstrip() {
	   jQuery("#filmstrip").removeClass('shown');
	}	

	/************************************
	 * 
	 *************************************/
	function updateOutputURLs() {
	    var mode = jQuery("#output").attr("data-mode");
	    jQuery("#output").val(app.outputs[mode]);
	    jQuery("#copy").show();
	}








	/************************************
	* Load a manifest
	* to do: if a manifest uses static images, we cannot use this tool
	* we need to alert the user
	* an example manifest with static jpgs at https://discover.york.ac.uk/ark:/36941/13192/presentation/3/manifest 
	*************************************/
	function load(url) {



	    // UCLA has an 'ark:' in their urls that need to be encoded
	    url = url.replace(/ark:\/(.*?)\/full/, function(r, a) {
	        var parts = a.split('/');
	        return "ark%3A%2F" + parts.join('%2F')+"/full";
	    });
	    url = url.replace(/ark:\/(.*?)\/manifest/, function(r, a) {
	        var parts = a.split('/');
	        return "ark%3A%2F" + parts.join('%2F')+"/manifest";
	    });

	    // if this is an Internet Archive URL
	    // convert it to a manifest
	    if (url.indexOf("archive.org") > 0 && url.indexOf("details") > 0) {
	        url = internetArchive2Manifest(url);
	    }


	    // if this is a IIIF image url, parse it
	    if (url.search(/\/([0-9]{1,3})\/(color|gray|bitonal|default)\.(png|jpg)/) > 0) {
	        parseSingleImage(url);
	    } else {



	    fetch(url).then(response => {
			  if (!response.ok) {
			      throw new Error(response.statusText);
			  }
			  return response.json();
	    })
	    .then(manifest => {
	    
	       var m = new IIIFConverter();
	       m.load(manifest);
	       
	       switch(m.type) {
	         case "Collection":
	             //if(m.items.length > 50) { m.items = m.items.slice(0, 49); console.log(m.items); }
	         
	             m.items.forEach(function(item) {
	                 load(item.id);
	             });
	         break;
	         case "Manifest":
	             app.manifests[url] = m;
	             addToGallery(url, m);
	             
	         break;	         
	       }

	    });

	    } // end if/else

	}
	
	/****************************
	* remove item from preview bar
	*****************************************/
	
	jQuery(document).on("click", ".filmstrip-item-close", function(e) {
	  jQuery(this).parent().parent().remove();
	  e.preventDefault();
	});
	
	
	
	
	/****************************
	* click on info icon in preview item
	*****************************************/
	
	jQuery(document).on("click", ".filmstrip-item-metadata", function(e) {
	
	  var manifest = jQuery(this).parent().parent().attr('data-manifest');
	  var canvas = jQuery(this).parent().parent().attr('data-canvas');
	  
	   // update the urls that go in the 'copy' textarea
	   updateOutputURLs();

	   var o = app.manifests[manifest];

	   var html = "";
	   html += "<p><label for='title'>Title:</label> <span id='title'>"+o.label+"</span></p>";
	   html += "<p><label for='descr'>Description:</label> <span id='descr'>"+o.description+"</span></p>";
	   
	   jQuery.each(o.metadata, function(i,v) {
	     html += "<p><label for='"+v.label+"'>"+v.label+":</label> <span id='"+v.label+"'>"+v.value+"</span></p>";
	   });
	   html += "<p><a href='"+manifest+"' target='_blank'><img src='assets/images/iiif.svg' class='icon'/></a></p>";
	   
	   html += "<p><strong>Manifest</strong>: "+manifest+"</p>";
	   html += "<p><strong>Canvas</strong>: "+canvas+"</p>";
	   html += "<p><strong>Region</strong>: "+region.join(',')+"</p>";
	   
	   
	   
	   jQuery('#modal_content').html(html);
	   jQuery('#modal').modal();

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
	    
	    // highlight corresponding canvas
	    jQuery(".gallery-item").removeClass('gallery-item-active');
	    jQuery(".gallery-item[data-service='" + app.selections[id].service + "']").addClass('gallery-item-active');	    
	    
	    // load the viewer
	    app.viewer.open(app.selections[id].service+"/info.json");
	    
    
	    if(app.selections[id].region !== 'full' || app.selections[id].region !== 'max') {
	            var overlayElement = document.createElement("div");
	            overlayElement.id = "overlay";
	            overlayElement.className = "highlight";

		    var region = app.outputs.region.split(',');

	            var c = [
	               (region[0] / app.outputs.width),
	               (region[1] / app.outputs.height),
	               (region[2] / app.outputs.width),
	               (region[3] / app.outputs.height)
	           ];
	           
	            
	            
	            app.viewer.addOverlay({
	                element: overlayElement,
	                location: new OpenSeadragon.Rect(c[0],c[1],c[2],c[3])
	            });
	            app.overlayOn = true;	    
	    }	    
	    
	    
	    
            //re-populate the url text field with the manifest url for this detail
	    var previous_manifest_url = jQuery("#url").val();

	    jQuery("#url").val(app.selections[id].manifest);

	    // if we are changing to a different manifest, reload the gallery of thumbs


	    if (previous_manifest_url != app.selections[id].manifest) {
	        load(app.selections[id].manifest);
	    }

	    //populate the output textarea with whatever mode is currently selected
	    app.outputs = app.selections[id];
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
	            html += "<li class='gallery-item' data-manifest='" + manifest + "' data-canvas='" + v.id + "' data-service='" + v.service + "' data-version='" + v.type + "' alt='image " + i + "'><img alt='" + v.label + "' src='" + v.service + "/full/,200/0/default.jpg'/><div class='gallery-item-label'>" + v.label + " </div></li>";
	        } else {
	            html += "<li class='gallery-item' data-manifest='" + v.manifest + "' data-canvas='" + v.canvas + "' data-service='" + v.service + "' data-version='" + v.version + "' alt='image " + i + "'><div class='gallery-item-label'>" + v.label + " </div></li>";
	        }
	    });	    
	    html += "</ul>";
	    html += "</div>";
	    
	    jQuery("#gallery").append(html);
	    
	}








	jQuery(document).on("click", ".copyable", function(e) {
	    var containerDiv = jQuery(this).parent().parent().find(".selectcrop");
	    //Make the container Div contenteditable
	    containerDiv.attr("contenteditable", true);
	    //Select the image
	    SelectText(containerDiv.get(0));
	    //Execute copy Command
	    //Note: This will ONLY work directly inside a click listener
	    document.execCommand('copy');
	    //Unselect the content
	    window.getSelection().removeAllRanges();
	    //Make the container Div uneditable again
	    containerDiv.removeAttr("contenteditable");
	    //Success!!
	    console.log("image copied!");
	});
	


   
   
   
   

   
   
	jQuery(".sidebar-right").click(function(e){
	  toggleRightSidebar();
	  e.preventDefault();
	});

	jQuery(".sidebar-left").click(function(e){
	  toggleLeftSidebar();
	  e.preventDefault();
	});   
   
   
   
   jQuery(".annotationpage").click(function(e){
     var ap = new AnnotationPage(app.selections);
     ap.create();
     e.preventDefault();
   });

  	
