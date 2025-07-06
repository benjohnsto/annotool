class Manifest {

    constructor(items) {
        this['@context'] = "http://iiif.io/api/presentation/3/context.json";
        this.id = "https://iiif.io/api/cookbook/recipe/0266-full-canvas-annotation/manifest.json";
        this.type = "Manifest";
        this.label = {'en':["This is my manifest"]};
        this.summary = {'en':["This is my summary"]};;
        this.items = [];
        this.processItems(items);
    }

    processItems(items) {
    //image, width, height, service, version, text, tags
      items.forEach((item)=>{
          var o = {
            "@context": "",
            "id": "",
            "type": "",
            "label": {"en":["the title"]},
            "items":[
              {
                "id": "something/canvas1",
                "type": "Canvas",
                "width": item.width,
                "height": item.height,
                "items": [

                {
                    "id": "something/canvas-1/annopage-1",
                    "type": "AnnotationPage",
                    "items": [
			    {
			      "id": "something/canvas-1/annopage-1/anno-1",
			      "type": "Annotation",
			      "motivation": "painting",
			      "body": {
				"id": item.image,
				"type": "Image",
				"format": "image/jpeg",
				"height": item.height,
				"width": item.width,
				"service": [
				  {
				    "id": item.service,
				    "profile": "level1",
				    "type": "ImageService3"
				  }
				]
			      },
			      "target": "something/canvas1"
			    }
			  ]
                  }


                ]
              }
            ],
      "annotations": [
        {
          "id": "https://iiif.io/api/cookbook/recipe/0266-full-canvas-annotation/canvas-1/annopage-2",
          "type": "AnnotationPage",
          "items": [
            {
              "id": "https://iiif.io/api/cookbook/recipe/0266-full-canvas-annotation/canvas-1/annopage-2/anno-1",
              "type": "Annotation",
              "motivation": "commenting",
              "body": {
                "type": "TextualBody",
                "language": "de",
                "format": "text/plain",
                "value": "Göttinger Marktplatz mit Gänseliesel Brunnen"
              },
              "target": "https://iiif.io/api/cookbook/recipe/0266-full-canvas-annotation/canvas-1"
            }
          ]
        }
      ]
          }
          
          
           this.items.push(o);
          
      });
      
     console.log(this);
    }


}
