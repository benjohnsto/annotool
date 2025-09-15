class IIIFConverter {

    constructor() {
        this.id = "";
        this.type = "";
        this.label = "";
        this.summary = "";
        this.items = [];
    }


    load(url, callback) {


        fetch(url).then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json();
            })
            .then(manifest => {
            
            
                if (manifest['@type']) {
                    switch (manifest['@type']) {
                        case "sc.Collection":
                            this.version = 2;
                            this.parsev2Collection(manifest);
                            break;
                        case "sc:Manifest":
                            this.version = 2;
                            this.parsev2(manifest);
                            break;
                        default:
                            console.log('Manifest Format Error', 'The JSON for this Manifest doesnt look like a Manifest.');
                            break;
                    }
                }

                // version 3
                else if (manifest.type) {

                    switch (manifest.type) {
                        case "Collection":
                            this.version = 3;
                            this.parsev3Collection(manifest);
                            break;
                        case "Manifest":
                            this.version = 3;
                            this.parsev3(manifest);
                            break;
                        default:
                            console.log('Manifest Format Error', 'The JSON for this Manifest doesnt look like a Manifest.');
                            break;
                    }

                } else {
                    console.log('Manifest Format Error', 'The JSON for this Manifest doesnt look like a Manifest. It should have either a @type or type value of Manifest');
                }

                //return manifest;

            }).then(() => {
                callback(this);
            }); // end then	


    }


    /************************************
     * Parse v2 Collection
     *************************************/
    parsev2Collection(collection) {
        this.id = collection['@id'];
        this.type = "Collection";
        this.label = this.getFirstValue(collection.label);
        //this.summary = this.getFirstValue(collection.summary);
        for (const item of collection.manifests) {
            var manifest = item['@id'];
            this.items.push({
                'id': manifest
            })
        }

    }


    /************************************
     * Parse v3 Collection
     *************************************/
    parsev3Collection(collection) {
        this.id = collection.id;
        this.type = "Collection";
        this.label = this.getFirstValue(collection.label);
        //this.summary = this.getFirstValue(collection.summary);
        for (const item of collection.items) {
            var manifest = item['id'];
            this.items.push({
                'id': manifest
            })
        }
    }




    /************************************
     * Parse a version 2 manifest
     *************************************/
    parsev2(manifest) {

        this.id = this.getFirstValue(manifest['@id']);
        this.type = "Manifest";
        this.label = this.getFirstValue(manifest.label);
        this.summary = this.getFirstValue(manifest.description);
        this.metadata = this.parseMetadata(manifest.metadata);

        if (manifest.sequences[0].canvases[0].images[0].resource.service['@context'] !== "http://iiif.io/api/image/2/context.json") {
            console.log('this does not use image api version 2');
        }

        if (manifest.sequences) {

            for (const sequence of manifest.sequences) {

                if ('canvases' in sequence) {

                    for (const canvas of sequence.canvases) {

                        var canvasID = canvas['@id'];

                        // sometimes canvases don't have images
                        if (canvas.images) {
                            var imageobj = {
                                "id": "",
                                "label": "",
                                "service": "",
                                "type": 2,
                                "version": 2,
                                "width": canvas.images[0].resource.width,
                                "height": canvas.images[0].resource.height
                            }
                            imageobj.id = canvasID;
                            imageobj.label = canvas.label;
                            imageobj.service = canvas.images[0].resource.service["@id"];
                            if (canvas.images[0].resource.service["@context"] !== "http://iiif.io/api/image/2/context.json") {
                                imageobj.type = 3;
                            }
                            // add this to the images array
                            this.items.push(imageobj);

                        } // end if canvas.images


                    }
                }
            }
        }
    }


    /************************************
     * Parse a version 3 manifest
     *************************************/
    parsev3(manifest) {

        this.id = this.getFirstValue(manifest['id']);
        this.type = "Manifest";
        this.label = this.getFirstValue(manifest.label);
        this.summary = this.getFirstValue(manifest.description);
        this.metadata = this.parseMetadata(manifest.metadata);


        if (manifest.items) {
            var items = manifest.items;
            for (const item of items) {

                var canvasID = item.id;

                if (item.items) {
                
                    var imageobj = {
                        "id": "",
                        "canvas": canvasID,
                        "label": "",
                        "service": "",
                        "type": "",
                        "version": 3,
                        "width": item.items[0].items[0].body.width,
                        "height": item.items[0].items[0].body.height
                    }

                    imageobj.id = canvasID;
                    // label
                    if (item.label) {
                        switch (typeof item.label) {
                            case 'object':
                                // get the first value
                                imageobj.label = Object.values(item.label)[0][0];
                                break;
                            case 'array':
                                imageobj.label = item.label[0];
                                break;
                            default: //string
                                imageobj.label = item.label;
                        }
                    } else {
                        imageobj.label = "";
                    }
                    // end label --------------------------


                    // service
                    var service = item.items[0].items[0].body.service;


                    if (service[0].type == 'ImageService3') {
                        imageobj.type = 3;
                    } else {
                        imageobj.type = 2;
                    }


                    if (typeof service === 'array') {
                        imageobj.service = service['@id'];
                    } else if (typeof service === 'object') {
                        if (service[0]) {
                            if (service[0]['id'] == null) {
                                imageobj.service = service[0]['@id'];
                            } else {
                                imageobj.service = service[0]['id']
                            }
                        } else {
                            imageobj.service = service.id;
                        }

                    }
                    // end service ------------------------------


                    // add this image to the images array
                    this.items.push(imageobj);
                } // end if item.items
            }
        }

    }



    /************************************
     * this is used to get metadata regardless of whether the
     * metadata is stored in objects, arrays, or strings
     ************************************/
    getFirstValue(o) {
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




    parseMetadata(metadata) {

        var a = [];

        metadata.forEach((v) => {
            var label = "";
            var value = "";

            if (v.label != null && v.value != null) {

                if (typeof v.label === "object") {
                    var x = Object.values(v.label)[0];
                    if (typeof x == 'object') {
                        label = Object.values(x)[0];
                    } else {
                        label = x;
                    }
                } else if (typeof v.label === Array) {
                    label = v.label[0];
                } else if (typeof v.label === "string") {
                    label = v.label;
                } else {
                    label = "";
                }

                if (typeof v.value === "object") {
                    var x = Object.values(v.value)[0];
                    if (typeof x == 'object') {
                        value = Object.values(x)[0];
                    } else {
                        value = x;
                    }
                } else if (typeof v.value === Array) {
                    value = v.value[0];
                } else if (typeof v.value === "string") {
                    value = v.value;
                } else {
                    value = "";
                }


                var r = {
                    "label": label,
                    "value": value
                }
                a.push(r);
            }
        })

        return a;
    }
    
    
    
    
    
    addCanvas(id,width,height,service, version, text) {
    var o = {
      "id": id+"/canvas-1",
      "type": "Canvas",
      "height": height,
      "width": width,
      "items": [
        {
          "id": id+"/canvas-1/annopage-1",
          "type": "AnnotationPage",
          "items": [
            {
              "id": id+"/canvas-1/annopage-1/anno-1",
              "type": "Annotation",
              "motivation": "painting",
              "body": {
                "id": service + "/full/max/0/default.jpg",
                "type": "Image",
                "format": "image/jpeg",
                "height": height,
                "width": width,
                "service": [
                  {
                    "id": service,
                    "profile": "level1",
                    "type": "ImageService"+version
                  }
                ]
              },
              "target": id+"/canvas-1"
            }
          ]
        }
      ],
      "annotations": [
        {
          "id": id+"/canvas-1/annopage-2",
          "type": "AnnotationPage",
          "items": [
            {
              "id": id+"/canvas-1/annopage-2/anno-1",
              "type": "Annotation",
              "motivation": "commenting",
              "body": {
                "type": "TextualBody",
                "language": "de",
                "format": "text/plain",
                "value": text
              },
              "target": id+"/canvas-1"
            }
          ]
        }
      ]
    }
    
    return o;
    }
    
    reconstruct() {
      console.log(this);
      var o = {'id': this.id, 'type': this.type, 'label': this.label, 'summary': this.summary, 'items': this.items}
      return o;
    }



}
