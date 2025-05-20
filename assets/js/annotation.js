


class Annotation {

  constructor() {
     this.type = "Annotation";
     this['@context'] = "http://www.w3.org/ns/anno.jsonld";
     this.label = "Slide One";
     this.body = [];
     this.target = [];
     this.motivation =  {
      "id": "http://www.w3.org/ns/oa#tagging",
      "label": "tagging"
     };
  }
  
  
  // type,value,purpose,format
  addBody(o) {
     this.body.push(o);
  }
  
  addTarget(target) {
    this.target = target;
  }

  
}
