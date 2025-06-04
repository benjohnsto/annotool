


	var app = {
	   'viewer': {},
	   'overlayOn': false,
	   'manifests': [],
	   'canvases':{},
	   'current':{},
	   'selections':{},
	   'annoPage':{
	     'id': 'thisistheid',
	     'type': 'AnnotationPage',
	     'items': []
	   }
	}

	var working = {};



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
	        defaultZoomLevel: 0.5,
	        preserveImageSizeOnResize: true
	    });

	    app.viewer.addHandler('rotate', function() {
	        working.rotation = viewer.viewport.getRotation();

	        if (working.rotation < 0) {
	            working.rotation = 360 + working.rotation;
	        }
	        if (working.rotation == 360) {
	            working.rotation = 0;
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
	            
	            working.overlay = location;
	            
		    // update current
		    working.region = region.join(',');
		    
		    working.large = working.service + "/" + region.join(',') + "/1200,/" + working.rotation + "/default.jpg";
		    working.small = working.service + "/" + region.join(',') + "/,300/" + working.rotation + "/default.jpg";
		    working.actual = working.service + "/" + region.join(',') + "/"+overlayHeight+"/" + working.rotation + "/default.jpg";
		    working.html = "<img alt='detail' src='" + working.small + "' data-manifest='" + working.manifest + "'/>";

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

	function resequenceSelections() {
	  var newselections = {};
	  jQuery(".filmstrip-item").each(function(i,v){
	     var id = jQuery(v).attr('id');
	     newselections[id] = app.selections[id];
	  });
	  app.selections = newselections;
	}

	/***********************
	* drag to sort
	********************************/
	$( "#filmstrip-tray" ).sortable({
	      update: function( ) {
		 resequenceSelections();
	      }
	});


	/*************************
	 * activate or de-activate crop mode
	 ***********************************/

	jQuery('#crop').click(function() {


	    //working = JSON.parse(JSON.stringify(working));

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

	}


	jQuery(".export").click(function(e){
	
	
	  resequenceSelections();
	  
	  app.annoPage.items = [];
	  
	  for (o in app.selections) {

	     var a = new Annotation();
	    
	    // do the text
	     var data = {"type":"Annotation","value":app.selections[o].textualbody,"purpose":"describing","format":"text/html"}
	     a.addBody(data);

	     // do the tags
	     if(app.selections[o].tags.length > 2) {
	     var tagarray = app.selections[o].tags.split(',').map(s => s.trim());
	     for(t in tagarray){
	       var tagdata = {"type":"Annotation","value":tagarray[t],"purpose":"tagging","format":"text/html"}
	       a.addBody(tagdata);	
	     }	     
	     }
	     
	     var canvas = app.selections[o].canvas;
	     if(app.selections[o].region.length > 0) { canvas+="#xywh="+app.selections[o].region; }
	     
	     var target = {"id":canvas,
	       "type": "Canvas",
	       "partOf": {
	          "id": "https://collections.library.yale.edu/manifests/16740417",
	          "type": "Manifest"
	        }
	     }
	     
	     a.addTarget(target);
             app.annoPage.items.push(a);
	  }
	  
	  
          var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(app.annoPage));
          var dlAnchorElem = document.getElementById('downloadAnchorElem');
          dlAnchorElem.setAttribute("href",     dataStr     );
          dlAnchorElem.setAttribute("download", "annotations.json");
          dlAnchorElem.click();
	
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
	   working.textualbody = jQuery("#textualbody").val();
	   working.tags = jQuery("#tags").val();
	   addSlide();
	   e.preventDefault();
	});
	
	
	function updateSlide() {
	   working.textualbody = jQuery("#textualbody").val();
	   working.tags = jQuery("#tags").val();
	   toggleRightSidebar();   
	}
	
	
	
	
	
	
	function addSlide() {
	
	   var id = makeid();
	   var textualbody = jQuery("#textualbody").val();
	   var tags = jQuery("#tags").val();

	   if(!jQuery.isEmptyObject(working) && working.region.indexOf(',') > 0) {
	       app.selections[id] = working;
	       app.selections[id].crop = true;
	   }
	   else { 
	       app.selections[id] = working;
	       app.selections[id].crop = false;	       
	   }

	// revert working back to original

	   app.selections[id].textualbody = textualbody;
	   app.selections[id].tags = tags;

	   jQuery(".active-item").removeClass('active-item');
	   
	   var alttext = "detail from " + app.manifests[working.manifest].label.replace("'","&apos;");
	   var mirador_link = "https://mcgrawcenter.github.io/mirador/?manifest=" + encodeURI(working.manifest) + "&canvas=" + working.canvas;


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
	    showHidePrevNext();
	    updateOutputURLs();
	    loadSelection(id);
	    disableCrop();
	}
	
	
	

	/******************************
	 *  The three output textarea modes
	 ********************************/

	jQuery(".setmode").click(function(e) {
	    var mode = jQuery(this).attr("data-mode");
	    setMode(mode);
	});


	function loadSelection(id) {
	
	  jQuery(".filmstrip-item").removeClass('active-item');
	  jQuery("#"+id).addClass('active-item');
	  
	  var manifest = jQuery(this).attr('data-manifest');
	  var canvas =   jQuery(this).attr('data-canvas');

          working = app.selections[id];
          working.selections = Object.keys(app.selections).reverse();

	
          working.next = 0;
          working.prev = 0;
          
         
          var index = working.selections.indexOf(id);
          var last = working.selections.length-1;
         
          if(working.selections.length > 1) {
            if(index == 0) { working.prev = working.selections[last]; working.next = working.selections[1];}
            else if (index == last) { working.prev = working.selections[last-1];working.next = working.selections[0]; }
            else { working.prev = working.selections[index - 1];working.next = working.selections[index + 1]; }
          }
          else {
            working.next = null;
            working.prev = null;
          }
          

	  jQuery(".nextprev.prev").attr('rel',working.prev);
	  jQuery(".nextprev.next").attr('rel',working.next);
          
          //working = app.selections[id];
          
	  if(working.crop == true) { 
	  
	      // disable crop here

	       var tilesource = {
	   	  type: 'image',
		  url:  working.large
	       }
	       app.viewer
	       app.viewer.open(tilesource);
	    }
	    else {
	       app.viewer.open(working.service+"/info.json");
	    }              
          /*
          app.viewer.open(working.service+"/info.json");

          if(working.crop==true) { 
                    app.viewer.removeOverlay("overlay");
                    app.viewer.removeOverlay("overlaytemp");
	            var overlayElement = document.createElement("div");
	            
	            overlayElement.id = "overlaytemp";
	            overlayElement.className = "highlight";
	            app.viewer.addOverlay({
	                element: overlayElement,
	                location: new OpenSeadragon.Rect(working.overlay.x, working.overlay.y, working.overlay.width, working.overlay.height)
	            });
   
           }
    	   */
	    // load annotations
	    jQuery("#textualbody").val(working.textualbody);
	    jQuery("#tags").val(working.tags);
	    
	    //highlight corresponding canvas
	    jQuery(".gallery-item").removeClass('active-item');
	    jQuery(".gallery-item[data-canvas='" + working.canvas + "']").addClass('active-item');

	    	
            //re-populate the url text field with the manifest url for this detail
	    jQuery("#url").val(app.selections[id].manifest);

	    //populate the output textarea with whatever mode is currently selected
	    updateOutputURLs();
	}
	
	jQuery(".nextprev.prev").click(function(e){
	  if(Object.keys(app.selections).length > 0) {
	    var target = jQuery(this).attr('rel');
	    loadSelection(target);
	  }
	  e.preventDefault();
	});
	jQuery(".nextprev.next").click(function(e){
	  if(Object.keys(app.selections).length > 0) {
	    var target = jQuery(this).attr('rel');
	    loadSelection(target);
	  }
	  e.preventDefault();
	});
	
	
	
	function loadCanvas(canvas, manifest) {
	
	  jQuery(".gallery-item").removeClass('active-item');
	  

	    var o = app.canvases[canvas];
	    
	    
	    //var alttext = app.manifests[working.manifest].label.replace("'","&apos;");
	    var alttext = o.label;
	    
            working = {
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
                "html": "<img alt='detail of "+alttext+"' src='"+ o.service + "/full/full/0/default.jpg' data-manifest='" + manifest + "'/>",
                "textualbody":"",
                "tags":""
            }
               
	    if (o.version == 3) { working.size = "max"; }
          
	    app.viewer.open(working.service+"/info.json");

	    // load annotations
	    jQuery("#textualbody").val(working.textualbody);
	    
	    jQuery("#tags").val(working.tags);
	    
	    //highlight corresponding canvas
	    jQuery(".gallery-item").removeClass('active-item');
	    jQuery(".gallery-item[data-canvas='" + working.canvas + "']").addClass('active-item');
	    	
            //re-populate the url text field with the manifest url for this detail
	    jQuery("#url").val(working.manifest);

	    //populate the output textarea with whatever mode is currently selected
	    updateOutputURLs();
	}	



	/******************
	 * select a gallery item
	 ***********************************************************/

	jQuery(document).on("click", ".gallery-item", function(e) {

	    var manifest = jQuery(this).attr('data-manifest');
	    var canvas =   jQuery(this).attr('data-canvas');
	    loadCanvas(canvas, manifest);
	    
	    // highlight this gallery item
	    jQuery(".gallery-item").removeClass('active-item');
	    jQuery(this).addClass('active-item');

	    // un-hilight any tray thumbs that might be highlighted
	    jQuery(".filmstrip-item").removeClass('active-item');

	    jQuery("#crop").removeClass("activated");
	    app.selectionMode = false;
	    app.viewer.setMouseNavEnabled(true);


	    //jQuery("#image").prop("checked", true);


	

	    jQuery.get(working.service + "/info.json", function(data) {

	        app.viewer.open(data);
	        app.viewer.tileSources.unshift(data);

	        // find out if this is a v2 or v3 image server
	        // to determine whether we should use 'full' or 'max'
	        if (typeof data['@context'] != 'undefined') {
	            if (data['@context'] == 'http://iiif.io/api/image/3/context.json') {
	                working.version = 3;
	            } else {
	                working.version = 2;
	            }
	        } else {
	            working.version = 2;
	        }


	        var zoom = app.viewer.viewport.getZoom();
	        var width = app.viewer.tileSources[0].width;
	        var adjustedwidth = parseInt((width * zoom) * 0.18);
	        var actual_size = working.service + "/full/" + adjustedwidth + ",/0/default.jpg";

	        working.size = adjustedwidth + ",";

	        setMode('large');

	        updateOutputURLs();


	    });

	   // app.mode = 'large';
	    e.preventDefault();
	});





	/******************
	 * click on a preview item in the tray
	 *************************************************/

	jQuery(document).on("click", ".filmstrip-item", function(e) {


	  // Target element to scroll to
	  var targetElement = $(".gallery-item[data-canvas='" + working.canvas + "']");
	  // scroll accompanying canvas into view
	  $("#gallery").animate({
	    scrollTop: targetElement[0].offsetTop - 120
	  }, 1000);


	  var id = jQuery(this).attr('id');
    	  loadSelection(id);

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
	    
	    jQuery("#gallery").prepend(html);
	    
	}










