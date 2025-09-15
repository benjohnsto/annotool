var app = {
    'viewer': {},
    'overlayOn': false,
    'manifests': [],
    'canvases': {},
    'current': {},
    'selections': {},
    'annoPage': {
        "@context": "http://www.w3.org/ns/anno.jsonld",
        "id": "http://example.org/page1",
        "type": "AnnotationPage",
        'items': []
    },
    'myManifest': {
        "@context": "http://iiif.io/api/presentation/3/context.json",
        "id": makeid(),
        "type": "Manifest",
        "label": {
            "en": [
                "This is my manifest"
            ]
        },
        "items": []
    },
    "label":"",
    "summary":"",
    "items":{}
}






var working = {};


function encode() {
    var data = JSON.stringify(app.annoPage);
    var enc1 = encodeURIComponent(data);
    var enc2 = btoa(enc1);

    return "carousel.html?data=" + enc2;

}


/******************
 * select a gallery item
 ***********************************************************/

jQuery(document).on("click", ".gallery-item", function(e) {

    var manifest = jQuery(this).attr('data-manifest');
    var canvas = jQuery(this).attr('data-canvas');
    
    jQuery("#manifest").val(manifest);
    jQuery("#canvas").val(canvas);

    var data = app.canvases[canvas];

    loadCanvas(canvas, data.manifest);

    // highlight this gallery item
    jQuery(".gallery-item").removeClass('active-item');
    jQuery(this).addClass('active-item');
    
    // un-hilight any tray thumbs that might be highlighted
    jQuery(".filmstrip-item").removeClass('active-item');
   
    //jQuery("#crop").removeClass("activated");
    app.selectionMode = false;
    app.viewer.setMouseNavEnabled(true);
    cropOff();
    e.preventDefault();
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

/*************************
 * Import
 ***********************************/
jQuery(".import").click(function(e) {
    doImport();
    e.preventDefault();
});



/*************************
 * Export
 ***********************************/
jQuery(".export").click(function(e) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(app.annoPage));
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "annotations.json");
    dlAnchorElem.click();
    e.preventDefault();
});



/*********************************
 * submit a url
 *******************************/

// submit a url
jQuery("#submit").click(function() {
    var url = jQuery("#url").val();
    app.current.manifest = url;
    var x = new IIIFConverter();
    x.load(url, function(m) {
        console.log(m);
        addManifest(url, m);
    });
});


jQuery("#saveannotations").click(function(e) {
    working.textualbody = jQuery("#textualbody").val();
    working.tags = jQuery("#tags").val();
    
    jQuery("#region").val("");
    jQuery("#manifest").val("");
    jQuery("#canvas").val("");
    jQuery("#textualbody").val("");
    jQuery("#tags").val("");
    
    // not sure how to save this
    e.preventDefault();
});


/*************************
 * add slide
 ***********************************/

jQuery('#addslide').click(function(e) {
    working.textualbody = jQuery("#textualbody").val();
    working.tags = jQuery("#tags").val();
    addItem(working.canvas, working.manifest);
    e.preventDefault();
});



function saveSelections() {


}





/******************************
 *  The three output textarea modes
 ********************************/

jQuery(".setmode").click(function(e) {
    var mode = jQuery(this).attr("data-mode");
    setMode(mode);
});




jQuery(".nextprev.prev").click(function(e) {
    if (Object.keys(app.selections).length > 0) {
        var target = jQuery(this).attr('rel');
        loadSelection(target);
    }
    e.preventDefault();
});
jQuery(".nextprev.next").click(function(e) {
    if (Object.keys(app.selections).length > 0) {
        var target = jQuery(this).attr('rel');
        loadSelection(target);
    }
    e.preventDefault();
});





/******************
	 * upload a file
	 ************************************************
            jQuery("#uploadfile").submit(function(e){
		    e.preventDefault();    
		    var formData = new FormData(this);

		    $.ajax({
			url: 'https://etcpanel.princeton.edu/IIIF/annotool/upload.php',
			type: 'POST',
			data: formData,
			success: function (data) {
			    jQuery("#importjson").val(data);
			    console.log(data);
			    app.annoPage = JSON.parse(data);
			    buildCanvasGallery();
			    buildFilmstrip();
			    
			},
			cache: false,
			contentType: false,
			processData: false
		    });
            });  
       */





/******************
 * click on a preview item in the tray
 *************************************************/

jQuery(document).on("click", ".filmstrip-item", function(e) {
    var canvas = jQuery(this).attr('data-canvas');
    var data = app.canvases[canvas];
    var id = jQuery(this).attr('id');
    
    working = app.items[id];
    
    console.log(working);
    jQuery("#region").val(working.region);
    jQuery("#manifest").val(working.manifest);
    jQuery("#canvas").val(working.canvas);
    jQuery("#textualbody").val(working.textualbody);
    jQuery("#tags").val(working.tags);
    
    // un-hilight any tray thumbs that might be highlighted
    jQuery(".filmstrip-item").removeClass('active-item');
    jQuery(this).addClass('active-item');
    
    console.log(app);    

    app.viewer.open(data.service + "/info.json");
    setView('v2');
    cropOn();
    //enableCrop();
});


/****************************
 * remove item from preview bar
 *****************************************/

jQuery(document).on("click", ".filmstrip-item-close", function(e) {
    e.stopPropagation();
    var parent = jQuery(this).parent().parent();
    var id = parent.attr('id');

    console.log(id);

    app.annoPage.items.forEach((item, index) => {
        if (item.id == id) {
            app.annoPage.items.splice(index, 1)
        }
    })
    buildFilmstrip();
    e.preventDefault();
});


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

jQuery(".sidebar-right").click(function(e) {
    toggleRightSidebar();
    e.preventDefault();
});

jQuery(".sidebar-left").click(function(e) {
    toggleLeftSidebar();
    e.preventDefault();
});


jQuery(".carousel").click(function(e) {
    toggleBothSidebars();
    var url = encode();
    console.log(url);
    window.open(url, '_blank').focus();
    e.preventDefault();
});

jQuery(".importexport").click(function(e) {
    jQuery("#importexport").val(JSON.stringify(app.annoPage, null, 2));
    var x = new IIIFConverter();
    x.id = "lskdjflskjdlskjdflskjd";
    x.type='Manifest';
    x.label='My Label';
    x.summary = 'This is my summary';
    /*
    for(i in app.items) {
      x.items.push(x.addCanvas('lksdjlfskjdlskjdlskjdf',i.width,i.height,i.service,i.version, i.text));
    }

    console.log(x.reconstruct());
    */
    jQuery("#importexport").val(JSON.stringify(app.items));
    openModal('myModal');

});
