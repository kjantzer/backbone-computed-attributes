/*
	Backbone Computed Attributes 0.1.1

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
*/

_.extend(Backbone.Model.prototype, {

	// computedAttrs: {
	// 	'key': {
	// 		events: ['reset'], 		// default event
	// 		compute: fn() OR string of method name on model
	// 	}
	// },

	compute: function(key){

		if( !this.computedAttrs || !this.computedAttrs[key] ){
			console.warn('A “'+key+'” computed attribute has not been defined.')
			return;
		}

		// define object to store computed attributes
		this.__computed_attributes = this.__computed_attributes || {};
		this.__computed_attributes_events = this.__computed_attributes_events || {};

		// compute the attribute value if not defined
		if( this.__computed_attributes[key] === undefined){
			
			var fn = this.computedAttrs[key].compute;
			var val = _.isFunction(fn) ? fn.call(this) : (this[fn] && _.isFunction(this[fn]) ? this[fn].call(this) : fn);

			// cache the computed val
			this.__computed_attributes[key] = val;

			// bind "stale on" events if needed
			if( this.__computed_attributes_events[key] != true ){

				var staleEvents = this.computedAttrs[key].events || ['reset', 'change:'+key];

				// bind each event
				_.each(staleEvents, function(eventKey){
					this.listenTo(this, eventKey, this._markComputedAttrStale.bind(this, key))
				}.bind(this))

				this.__computed_attributes_events[key] = true;

			} // bind stale events

		}

		// return the computed value
		return this.__computed_attributes[key];
	},

	_markComputedAttrStale: function(key){
		this.__computed_attributes && this.__computed_attributes[key] && delete this.__computed_attributes[key];
	}

})