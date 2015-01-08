/*
	Backbone Computed Attributes 0.2.1

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

	Use:

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

	NOTE: computed attributes are setup on initialize. If you need to override the init
	method on a model, make sure to first call:
		`this.setupComputedAttrs()`
*/

_.extend(Backbone.Model.prototype, {

	// computedAttrs: {
	// 	'key': {
	// 		events: ['reset'], 		// default event
	// 		compute: fn() OR string of method name on model
	// 	}
	// },

	initialize: function(){
		this.setupComputedAttrs();
	},

	setupComputedAttrs: function(){
		if( this.computedAttrs && !this.__computed_attributes_setup ){
			this.__computed_attributes_setup = true;
			_.each(this.computedAttrs, this._setupComputedAttr, this);
		}
	},

	_setupComputedAttr: function(data, key){

		var fn = data.compute;
		if( this[fn||key] && _.isFunction(this[fn||key]) ){

			// switch the compute method with the one found on the model
			data.compute = this[fn||key];

			// switch the model method with a call to the compute method
			Object.getPrototypeOf(this)[fn||key] = function(){
				return this.compute(key);
			}
		}
	},

	// for debuging purposes
	disableComputedAttrs: function(){ this.__computed_attributes_disabled = true; },
	enableComputedAttrs: function(){ delete this.__computed_attributes_disabled; },

	compute: function(key){

		if( !this.computedAttrs || !this.computedAttrs[key] ){
			console.warn('A “'+key+'” computed attribute has not been defined.')
			return;
		}

		// define object to store computed attributes
		this.__computed_attributes = this.__computed_attributes || {};
		this.__computed_attributes_events = this.__computed_attributes_events || {};

		// compute the attribute value if not defined
		if( this.__computed_attributes[key] === undefined || this.__computed_attributes_disabled === true){
			
			var fn = this.computedAttrs[key].compute;
			var val = _.isFunction(fn) ? fn.call(this) : (this[fn||key] && _.isFunction(this[fn||key]) ? this[fn||key].call(this) : fn);

			// cache the computed val
			this.__computed_attributes[key] = val;

			// bind "stale on" events if needed
			if( this.__computed_attributes_events[key] != true ){

				var staleEvents = this.computedAttrs[key].events || ['reset', 'change:'+key];
				this.__computed_attributes_stale_events = this.__computed_attributes_stale_events || {}

				// bind each event
				_.each(staleEvents, function(eventKey){

					this.__computed_attributes_stale_events[eventKey] = this.__computed_attributes_stale_events[eventKey] || []
					this.__computed_attributes_stale_events[eventKey].push(key)

					this.listenTo(this, eventKey, this._markComputedAttrStale.bind(this, eventKey))

				}.bind(this))

				this.__computed_attributes_events[key] = true;

			} // bind stale events

		}

		// return the computed value
		return this.__computed_attributes[key];
	},

	_markComputedAttrStale: function(eventKey){

		var keys = this.__computed_attributes_stale_events[eventKey];

		_.each(keys, function(key){
			
			this.__computed_attributes && delete this.__computed_attributes[key]

			this.trigger('change:computed:'+key, this);

		}.bind(this));
	}

})

