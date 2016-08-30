

export default function Feature(context){
  function constructor(opts,transform){

    this.isRendered = false;
    this.configure(opts);

    if(!opts.render) throw new Error( 'Your feature needs to have render function defined!' );
    this.render = opts.render.bind(context);

    if(opts.update)
      this.update = opts.update.bind(context);
    else
      this.update = function(){};

    if(transform)
      this.data = function(){
        return transform(context.data());
      };

    this.draw = function(){
      if(this.isRendered){
        this.update();
      } else {
        this.render();
        this.isRendered = true;
      }
    }

    return this;
  }

  constructor.prototype = context;

  function feature(_opts){

    var self = feature;
    if(arguments.length){
      // shim for using Chart as Feature;
      var opts = _opts.opts || _opts;
      self[opts.name] = new constructor(opts,arguments[1]);
      if(context.isRendered) self[opts.name].draw();
      return context;
    }

    for(var k in self )
      self[k].draw();

    return context;
  }

  return feature

}
