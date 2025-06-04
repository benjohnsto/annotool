function init() {


    /**************************
     * if there is a manifest url var, load it
     *************************************************/
    var vars = getURLValues();

    if (typeof vars.manifest !== 'undefined') {
        var url = vars.manifest;
        jQuery("#url").val(url);
        jQuery("#gallery").empty();
        load(url);
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
            values[part[0]] = window.decodeURIComponent(part[1]);
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
    addToGallery(url, o);

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

	/****************************
	* remove item from preview bar
	*****************************************/
	
	jQuery(document).on("click", ".filmstrip-item-close", function(e) {
	  var parent = jQuery(this).parent().parent()
	  var id = parent.attr('id');
	  delete app.selections[id];
	  parent.remove();
	  
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
	         case "Annotation":
	             m.items.forEach(function(item) {
	                 load(item.id);
	             });
	         break;	         	         
	       }

	    });

	    } // end if/else

	}




	/*********************************
	 * ACTIONS
	 *******************************/

	// submit a url
	jQuery("#submit").click(function() {
	    var url = jQuery("#url").val();
	    app.current.manifest = url;
	    //jQuery("#gallery").empty();
	    load(url);
	});
	
	
	
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
	    jQuery("#output").val(app.current[mode]);
	    jQuery("#copy").show();
	}




	
	
