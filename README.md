Backbone Computed Attributes 0.2.0
==============================

###Extends Backbone.Model with support for cached computed attributes.


Sometimes there is a need for a computed model attribute, whether it
be formatting a date or doing a complex lookup, filter and/or mapping.
Doing this computation too often (like when rending a lot in a ListController)
can cause a slow down. Computed Attributes effectively caches a computed result
until a model event flags it as stale (in need of computation again)

When computed attributes are marked stale, they are not recomputed
until requested.

https://github.com/kjantzer/backbonejs-computed-attributes

@author Kevin Jantzer  
@since 2014-11-21  

##General Use

```javascript
// first define one or more computed attributes
computedAttrs: {

	// attr key
	'full_name': {

		// these model events will mark the computed attribute as "stale" (needs computed again)
		events: ['reset', 'change:first_name', 'change:last_name'],

		// this method does the computing. A method name "string" can be used in place of an inline function
		compute: function(){
			return this.get('first_name')+' '+this.get('last_name');
		}
	}
}

// later, you can request the computed attribute using:
this.compute('full_name'); // value computed
this.compute('full_name'); // cached value returned;
this.fetch();
this.compute('full_name'); // value computed
```

## Advanced Use

It is cleaner to put all the compute methods directly on the `model` to make calling them easier

```javascript
// I like this
this.fullName()

// better than this
this.compute('full_name');
```

**ComputedAttrs supports this**

```javascript
var Model = Backbone.Model.extend({

	computedAttrs: {

		'full_name': {
			events: ['reset', 'change:first_name', 'change:last_name'],
			compute: 'fullName'
		}
	},

	// this method does the computing. A method name "string" can be used in place of an inline function
	fullName: function(){
		return this.get('first_name')+' '+this.get('last_name');
	}

})

var m = new Model();

m.fullName(); // value computed
m.fullName(); // cached value returned;
this.fetch();
m.fullName(); // value computed
```

*NOTE: for this advanced option to work, `setupComputedAttrs` must be called. ComputedAttrs sets an initialize method that calls this setup routine automatically, but if you want to use your own `initialize` method and use computed attributes, make sure to call it yourself.*