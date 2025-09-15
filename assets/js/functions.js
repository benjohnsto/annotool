var p ={};

function init() {


    /**************************
     * if there is a manifest url var, load it
     *************************************************/
    var vars = getURLValues();

    if (typeof vars.manifest !== 'undefined') {
        var url = vars.manifest;
        jQuery("#url").val(url);
        jQuery("#gallery").empty();
      var x = new IIIFConverter();
      x.load(url, function(m){
        addManifest(url, m);
      });
    }


    /**************************
     * tippy tooltip
     *************************************************/

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


      /***********************
      * drag to sort
      ********************************/
      $( "#filmstrip-tray" ).sortable({
            update: function( ) {
             resequenceSelections();
            }
      });

          /**************************
           * initialize OSD
           ********************/
          app.viewer = OpenSeadragon({
              id: "viewer",
              prefixUrl: "assets/js/openseadragon/images/",
              tileSources: [],
              showFullPageControl: false,
              showRotationControl: true,
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

                  //var w = app.viewer.tileSources[0].width;
                  //var h = app.viewer.tileSources[0].height;
                  var w = app.viewer.world.getItemAt(0).source.dimensions.x;
                  var h = app.viewer.world.getItemAt(0).source.dimensions.y;
                  
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

                 // updateOutputURLs();
              },
              releaseHandler: function(event) {

                  if (app.selectionMode == true) {

               
 /*              
                  for(id in app.items) {
                    if(id == working.id) {
                      app.items[id] = working;
                      //item.target.id += "#xywh=" + working.region;
                    }
                  };                  
                  

                  app.annoPage.items.forEach((item)=>{
                    if(item.id == working.id) {
                      //console.log(working.region);
                      item.target.id += "#xywh=" + working.region;
                    }
                  });
*/
		  jQuery("#region").val(working.region);
                  buildFilmstrip();
                  
                  var img = {'type':'image','url': working.large}
		  app.viewer.open(img);
		  cropOff();
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
                      //updateOutputURLs();

                  }

                  drag = null;

              }
          });




} // end init()

/************************************
 * 
 *************************************/
function internetArchive2Manifest(url) {
    var parts = url.split("/");
    for (var x = 0; x <= parts.length; x++) {
        if (parts[x] == 'details') {
            var ia_id = parts[x + 1];
            return "https://iiif.archive.org/iiif/" + ia_id + "/manifest.json";
        }
    }
}

/*************************
 * get the url vars
 ***********************************/

function getURLValues() {

    var search = window.location.search.replace(/^\?/, '').replace(/\+/g, ' ');
    var values = {};

    if (search.length) {
        var part, parts = search.split('&');

        for (var i = 0, iLen = parts.length; i < iLen; i++) {
            part = parts[i].split('=');
            values[part[0]] = part[1];//window.decodeURIComponent(part[1]);
        }
    }
    return values;
}


/************************************
 * 
 *************************************/
function wikimediaCommons2Manifest(url) {
    var parts = url.split("File:");
    return "https://iiif.juncture-digital.org/wc:" + parts[1] + "/manifest.json";
}

/************************************
 * 
 *************************************/
function toggleLeftSidebar() {
    if (jQuery("#main").hasClass('v1')) { 
        jQuery("#main").removeClass('v1');
    } else if (jQuery("#main").hasClass('v2')) {
        jQuery("#main").removeClass('v2');
        jQuery("#main").addClass('v3');
    } else if (jQuery("#main").hasClass('v3')) {
        jQuery("#main").removeClass('v3');
        jQuery("#main").addClass('v2');
    } else {
        jQuery("#main").addClass('v1');
    }
}
/************************************
 * 
 *************************************/
function toggleRightSidebar() {
    if (jQuery("#main").hasClass('v1')) { 
        jQuery("#main").removeClass('v1');
        jQuery("#main").addClass('v3');
    } else if (jQuery("#main").hasClass('v2')) {
        jQuery("#main").removeClass('v2');
    } else if (jQuery("#main").hasClass('v3')) {
        jQuery("#main").removeClass('v3');
        jQuery("#main").addClass('v1');
    } else {
        jQuery("#main").addClass('v2');
    }
}

/************************************
 * 
 *************************************/
function toggleBothSidebars() {
    if (jQuery("#main").hasClass('v2')) {
        jQuery("#main").removeClass('v2');
        jQuery("#main").addClass('v1');
    } else if (jQuery("#main").hasClass('v3')) {
        jQuery("#main").removeClass('v3');
        jQuery("#main").addClass('v1');
    } else {
        jQuery("#main").addClass('v1');
    }
}

/************************************
 * 
 *************************************/
function wikimediaCommons2Manifest(url) {
    var parts = url.split("File:");
    return "https://iiif.juncture-digital.org/wc:" + parts[1] + "/manifest.json";
}


/************************************
 *  allow user to submit a single iiif image url
 *************************************/
function parseSingleImage(url) {
    var s = url.split("/").slice(0, -4);
    var service = s.join("/");
    // initialize an object that will contain info
    var o = {
        'id': url,
        'label': '',
        'service': service,
        'thumb': service + '/full/300,/0/default.jpg',
        'type': 2,
        'items': []
    }


    var item = {
        'id': url,
        'label': '',
        'service': service,
        'thumb': service + '/full/300,/0/default.jpg',
        'type': 2
    }
    o.items.push(item);

    CT.manifests[url] = o;
    addManifest(url, o);

}


/************************************
 * 
 *************************************/
function internetArchive2Manifest(url) {
    var parts = url.split("/");
    for (var x = 0; x <= parts.length; x++) {
        if (parts[x] == 'details') {
            var ia_id = parts[x + 1];
            return "https://iiif.archive.org/iiif/" + ia_id + "/manifest.json";
        }
    }
}
/************************************
 * 
 *************************************/
function makeid() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < 12) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}


/************************************
 * 
 *************************************/
function copytext() {
    var copytext = document.getElementById("output");
    copytext.select();
    copytext.setSelectionRange(0, 99999); // For mobile devices
    navigator.clipboard.writeText(copytext.value);
}


/************************************
 * https://stackoverflow.com/questions/33175909/copy-image-to-clipboard
 * Cross-browser function to select content
 *************************************/


function SelectText(element) {
    var doc = document;
    if (doc.body.createTextRange) {
        var range = document.body.createTextRange();
        range.moveToElementText(element);
        range.select();
    } else if (window.getSelection) {
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

      /************************************
       * 
       *********************************/

      function parseMetadata(metadata) {

          var a = [];

          // then get the metadata
          jQuery.each(metadata, function(i, v) {
              var label = getFirstValue(v.label);
              var value = getFirstValue(v.value);
              var r = {
                  "label": label,
                  "value": value
              }
              a.push(r);
          });
          return a;

      }


      /************************************
       * 
       *********************************/

      function getFirstValue(o) {
          if (typeof o === "object") {
              var x = Object.values(o)[0];
              if (typeof x == 'object') {
                  return Object.values(x)[0];
              } else {
                  return x;
              }
          } else if (typeof o === "array") {
              return o.label[0];
          } else if (typeof o === "string") {
              return o;
          } else {
              return "";
          }
      }
      
      



 
   
   
   
   jQuery(".annotationpage").click(function(e){
     var ap = new AnnotationPage(app.selections);
     ap.create();
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

            
          /*
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
                   addManifest(url, m);
                   
               break;
               case "Annotation":
                   m.items.forEach(function(item) {
                       load(item.id);
                   });
               break;                              
             }

          }); // end fetch
          */

          } // end if/else

      }




      function doImport() {
        var json = JSON.parse(jQuery("#importexport").val());
        app.annoPage = json;
        var manifests = [];
        json.items.forEach((item)=>{
          var manifest = item.target.partOf.id;
          if(manifests.indexOf(manifest) === -1) { manifests.push(manifest); }
        });

        app.manifests = [];
        jQuery("#gallery").empty();
        
       
        manifests.forEach((m)=>{           
          var x = new IIIFConverter();
            x.load(m, function(data){
              addManifest(m, data);
              buildFilmstrip();
            });
        });


      }

      
      
      
      /******************************
       *  Set the mode
       ********************************/
      function setMode(mode) {
          jQuery("input[id='" + mode + "']").prop("checked", true);
          jQuery("#output").attr("data-mode", mode);
          updateOutputURLs();
          jQuery(".filmstrip-item.active-item").find(".filmstrip-item-external").attr('href', app.current[mode]);
      }      

      function showHidePrevNext(){
        if(Object.keys(app.selections).length > 1) {
          jQuery('#viewer-prev').css('display','flex');
          jQuery('#viewer-next').css('display','flex');
        }
        else {
          jQuery('#viewer-prev').hide();
          jQuery('#viewer-next').hide();
        }
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
          jQuery("#output").val(working[mode]);
          jQuery("#copy").show();
      }


      function resequenceSelections() {
        var newitems = [];
        jQuery(".filmstrip-item").each(function(i,v){
           var id = jQuery(v).attr('id');
           jQuery.each(app.items, function(i,v){
             if(v.id === id) { newitems.push(v); }
           });
        });
        app.items = newitems;
        
      }
      
      
      function cropOn() {
        jQuery("#crop").removeClass("disabled");
      }
      
      function cropOff() {
        jQuery("#crop").addClass("disabled");
      }
      
      function filmstripItemHighlight(id, canvas) {
        jQuery('.filmstrip-item').removeClass('active');
      }

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
      
      function updateSlide() {
         working.textualbody = jQuery("#textualbody").val();
         working.tags = jQuery("#tags").val();
         toggleRightSidebar();   
      } 
      
      function setView(view) {
       jQuery("#main").removeClass();
       jQuery("#main").addClass(view);
      }           

      
      function buildCanvasGallery() {
        app.manifests = [];
        jQuery("#gallery").empty();
        
        app.annoPage.items.forEach((item)=>{
           var manifest = item.target.partOf.id;
           if(app.manifests.indexOf(manifest) < 0) {
            app.manifests.push(manifest);
            load(manifest);
           }     
        });
              
      }
      
      
      function buildFilmstrip() {

         jQuery("#filmstrip-tray").empty();
         
         console.log(app.items);
        
         for(id in app.items) {
         
	   var image = "";
	   if(app.items[id].region.indexOf(',') > -1) {
	     image = app.items[id].service + "/"+app.items[id].region+"/200,/0/default.jpg";
	   }
	   else {
	     image = app.items[id].service + "/full/200,/0/default.jpg";
	   }
	   
	   var alttext = "This is a description";
	   
             var slide = `<div id='` + id + `' class='filmstrip-item' data-canvas='`+ app.items[id].canvas +`'>
                <div><img src='`+image+`' data-manifest='`+app.items[id].manifest+`'/></div>
                <div class='selectcrop copyable' style='position:absolute;top:0px;left:0px;z-index:-100'>
                <a href='` + app.items[id].manifest + `' title='`+alttext+`' target='_blank'>
                <img alt='detail of' src='`+image+`' data-manifest='"+manifest+"'/>
                </a>
                </div>
                <span class='filmstrip-item-tools'>
                 <a href='#' class='copyable'><img src='assets/images/copy.svg' class='icon-sm'/></a>
                 <a href='#' class='filmstrip-item-metadata'><img src='assets/images/info-circle-white.svg' class='icon-sm'/></a>
                 <a href='` + image + `' class='filmstrip-item-external' target='_blank'><img src='assets/images/external-white.svg' class='icon-sm'/></a>
                 <a href='#' class='filmstrip-item-close'><img src='assets/images/x-white.svg' class='icon-sm'/></a></span></div>`;	   
	   jQuery("#filmstrip-tray").append(slide);
	   showFilmstrip();

         }
      }
      
      

      function buildFilmstripFromAnnotation() {

         jQuery("#filmstrip-tray").empty();
         
         app.annoPage.items.forEach((item)=>{

             var image = "";
             var parts = item.target.id.split("#xywh=");
             var canvas = parts[0];

              
             var data = app.canvases[canvas];
             if(parts.length > 1) {
               image = data.service + "/"+parts[1]+"/200,/0/default.jpg";
             }
             else {
               image = data.service + "/full/200,/0/default.jpg";
             }
             
             
             var alttext = "detail from ";
             var manifest = item.target.partOf.id;
             var canvas = item.target.id;
             var mirador_link = "https://mcgrawcenter.github.io/mirador/?manifest=";
             

             var slide = `<div id='` + item.id + `' class='filmstrip-item' data-canvas='`+ canvas +`'>
                <div><img src='`+image+`' data-manifest='`+manifest+`'/></div>
                <div class='selectcrop copyable' style='position:absolute;top:0px;left:0px;z-index:-100'>
                <a href='` + manifest + `' title='`+alttext+`' target='_blank'>
                <img alt='detail of' src='`+image+`' data-manifest='"+manifest+"'/>
                </a>
                </div>
                <span class='filmstrip-item-tools'>
                 <a href='#' class='copyable'><img src='assets/images/copy.svg' class='icon-sm'/></a>
                 <a href='#' class='filmstrip-item-metadata'><img src='assets/images/info-circle-white.svg' class='icon-sm'/></a>
                 <a href='` + image + `' class='filmstrip-item-external' target='_blank'><img src='assets/images/external-white.svg' class='icon-sm'/></a>
                 <a href='#' class='filmstrip-item-close'><img src='assets/images/x-white.svg' class='icon-sm'/></a></span></div>`;
   
            jQuery("#filmstrip-tray").append(slide);
            showFilmstrip();


         });
      }
      
      
      function addItem(canvas, manifest) {
      
      /*
        working.zoom = app.viewer.viewport.getZoom();
        var osdcenter = app.viewer.viewport.getCenter();
        working.center = app.viewer.viewport.viewportToImageCoordinates(osdcenter.x, osdcenter.y);
               
        var pix = parseInt((working.width * 0.5) * ( 1 / working.zoom ));
        
        working.viewportregion = [
          parseInt(working.center.x) - pix,
          parseInt(working.center.y) - pix,
          parseInt(pix * 2),
          parseInt(pix * 2)
          ]
       */
        var identifier = makeid();
        app.items[identifier] = structuredClone(working);
        //app.items[identifier] = working;
        app.items[identifier].id = identifier;
        buildFilmstrip();
      }
      
      
      
      function addAnnotation(canvas, manifest) {
      

         
         var item = {
                  "id": makeid(),
                  "@context": "http://www.w3.org/ns/anno.jsonld",
                  "type": "Annotation",
                  "body": [],
                  "created": "",
                  "creator": "",
                  "target": {
                    "id": canvas,
                    "type": "Canvas",
                    "partOf": {
                      "id": manifest,
                      "type": "Manifest"
                    }
                  },
                  "scope": "ART100"
                }         
         
         
         
         
         var textualbody = jQuery("#textualbody").val();
         if(textualbody != "") {
            var body = { "type": "TextualBody", "value": textualbody }
            item.body.push(body);
         }
         var tags = jQuery("#tags").val();
         if(tags != "") {
           var tagarray = tags.split(',').map(s => s.trim());
           for(t in tagarray){
             var body = {"type":"Annotation","value":tagarray[t],"purpose":"tagging","format":"text/html"}
             item.body.push(body);
           }
         }  
         
        // now the image
         if(!jQuery.isEmptyObject(working) && working.region.indexOf(',') > 0) {
             var image = working.service+"/"+working.region+"/600,/0/default.jpg";
         }
         else { 
             var image = working.service+"/full/600,/0/default.jpg";
         }        
        var body = {"type":"Image","value":image,"format":"image/jpeg"}
        item.body.push(body);                  

        app.annoPage.items.push(item);
        buildFilmstrip();
      }
      
      
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
        
            // if this is a crop, disable cropping button
            jQuery("#crop").addClass('disabled');

             var tilesource = {
                 type: 'image',
              url:  working.large
             }
             app.viewer
             app.viewer.open(tilesource);
          }
          else {
            // if this is not a crop, enable cropping button
            jQuery("#crop").removeClass('disabled');          
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
          
          working.full = o.service + "/full/"+working.size+"/0/default.jpg",
          
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
      

      /************************************
       * 
       *********************************/

      function addManifest(manifest, item) {
      
          if(app.manifests.indexOf(manifest) > -1) {
             alert("This item already exists");
          }
          else {
            app.manifests.push(manifest);
      
            var html = "<div>";
            html += "<p class='gallery-manifest-label'>" + item.label + "</p>";
            html += "<ul>";
          
          
          
            jQuery.each(item.items, function(i, v) {

                app.canvases[v.id] = v;
                app.canvases[v.id].manifest = manifest;
          
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
          
      }

      
      
      
      
      /*************** MODAL ***************/
      
      // Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
//var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
/*
btn.onclick = function() {
  modal.style.display = "block";
}
*/

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
} 

    function openModal(modalId) {
       jQuery('#'+modalId).css('display', 'block');
    }
    
    function closeModal(modalId) {
       jQuery('#'+modalId).css('display', 'none');
    }


      /*************** END MODAL ***************/            
