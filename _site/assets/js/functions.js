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
	
	
	
	
	
	
