  var carousel = {
    'viewer':{},
    'slides':[]
  
  }


	    /**************************
	     * initialize OSD
	     ********************/
	    carousel.viewer = OpenSeadragon({
	        id: "carousel-viewer",
	        prefixUrl: "assets/js/openseadragon/images/",
	        showFullPageControl: false,
	        showRotationControl: true,
    sequenceMode: true,    
    showReferenceStrip: true,
    referenceStripScroll: 'horizontal',
	        tileSources: [
        "https://libimages1.princeton.edu/loris/pudl0001%2F4609321%2Fs42%2F00000001.jp2/info.json",
        "https://libimages1.princeton.edu/loris/pudl0001%2F4609321%2Fs42%2F00000002.jp2/info.json",
        "https://libimages1.princeton.edu/loris/pudl0001%2F4609321%2Fs42%2F00000003.jp2/info.json",
        "https://libimages1.princeton.edu/loris/pudl0001%2F4609321%2Fs42%2F00000004.jp2/info.json",
        "https://libimages1.princeton.edu/loris/pudl0001%2F4609321%2Fs42%2F00000005.jp2/info.json",
        "https://libimages1.princeton.edu/loris/pudl0001%2F4609321%2Fs42%2F00000006.jp2/info.json",
        "https://libimages1.princeton.edu/loris/pudl0001%2F4609321%2Fs42%2F00000007.jp2/info.json"
    ]
	        
	    });
	    
	    
	    
	    //carousel.viewer.open("https://iiif-cloud.princeton.edu/iiif/2/24%2F61%2Ffd%2F2461fd191da44f098c94090f4207c6f5%2Fintermediate_file/info.json");
	    
	    
	    


