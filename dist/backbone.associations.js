/**
 * Backbone.Associations v0.1.0
 * https://github.com/DreamTheater/Backbone.Associations
 *
 * Copyright © 2012 Dmytro Nemoga
 * Released under the MIT license.
 */

(function () {
    'use strict';

    var Model = Backbone.Model;

    /**
     * @class Backbone.Model
     */
    Backbone.Model = _.extend(function (attributes, options) {
        // Ensure options
        options = _.extend({}, options);

        // Resolve associations
        this.associations = options.associations || this.associations || {};

        // Create reference to associated models
        _.each(this.associations, function (options) {
            var relations = _.pick(options, ['belongsTo', 'hasOne', 'hasMany']),
                // Association type (first in the set)
                type = _.keys(relations)[0],
                // Associated collection
                collection = relations[type];

            // Create reference methods
            this[type]({
                collection: collection,
                // Configuration
                name: options.as,
                foreignKey: options.by
            });
        }, this);

        // Call original constructor
        Model.apply(this, arguments);
    }, Model, {
        prototype: _.extend(Model.prototype, {
            belongsTo: function (options) {
                return this._createReference({
                    getter: function (collection) {
                        // ID of associated model
                        var id = this.get(options.foreignKey);

                        return collection.get(id);
                    },

                    setter: function (collection, model) {
                        return this.set(options.foreignKey, model.id);
                    },

                    builder: function (collection, attributes) {

                    },

                    creator: function (collection, attributes) {

                    }
                }, options);
            },

            hasOne: function (options) {
                return this._createReference({
                    getter: function (collection) {
                        var attributes = {};

                        // Condition to model identification
                        attributes[options.foreignKey] = this.id;

                        return collection.where(attributes)[0];
                    },

                    setter: function (collection, model) {

                    },

                    builder: function (collection, attributes) {

                    },

                    creator: function (collection, attributes) {

                    }
                }, options);
            },

            hasMany: function (options) {
                return this._createReference({
                    getter: function (collection) {
                        return collection;
                    }
                }, options);
            },

            toJSON: _.wrap(Model.prototype.toJSON, function (toJSON, options) {
                // Ensure options
                options = _.extend({
                    associations: false
                }, options);

                var attributes = toJSON.call(this, options);

                if (options.associations) {

                }

                return attributes;
            }),

            _createReference: function (reference, options) {
                // Create getName() reference
                if (_.isFunction(reference.getter)) {
                    this['get' + options.name] = _.wrap(reference.getter, function (getter) {
                        // Associated collection
                        var collection = this._resolveCollection(options);

                        return getter.call(this, collection);
                    });
                }

                // Create setName(model) reference
                if (_.isFunction(reference.setter)) {
                    this['set' + options.name] = _.wrap(reference.setter, function (setter, model) {
                        // Associated collection
                        var collection = this._resolveCollection(options);

                        return setter.call(this, collection, model);
                    });
                }

                // Create buildName(attributes) reference
                if (_.isFunction(reference.builder)) {
                    this['build' + options.name] = _.wrap(reference.builder, function (builder, attributes) {
                        // Associated collection
                        var collection = this._resolveCollection(options);

                        return builder.call(this, collection, attributes);
                    });
                }

                // Create createName(attributes) reference
                if (_.isFunction(reference.creator)) {
                    this['create' + options.name] = _.wrap(reference.creator, function (creator, attributes) {
                        // Associated collection
                        var collection = this._resolveCollection(options);

                        return creator.call(this, collection, attributes);
                    });
                }

                return this;
            },

            _resolveCollection: function (options) {
                return _.result(options, 'collection');
            }
        })
    });

    /**
     * @function Backbone.sync
     */
    Backbone.sync = _.wrap(Backbone.sync, function (sync, method, context, options) {
        // Call native "sync" for all methods except "read"
        if (method !== 'read') {
            return sync.call(this, method, context, options);
        }

        // Ensure options
        options = _.extend({}, options);

        var deferred = $.Deferred(),

            complete = _.bind(function (complete, jqXHR, textStatus) {
                // Clear XHR cache
                delete this._xhrCache;

                // Run custom callback
                if (_.isFunction(complete)) {
                    complete.call(this, this, jqXHR, textStatus);
                }
            }, context),

            success = _.bind(function (success, data, textStatus, jqXHR) {
                // Resolve deferred
                deferred.resolve(data, textStatus, jqXHR);

                // Run custom callback
                if (_.isFunction(success)) {
                    success.call(this, this, data, options);
                }
            }, context),

            error = _.bind(function (error, jqXHR, textStatus, errorThrown) {
                // Reject deferred
                deferred.reject(jqXHR, textStatus, errorThrown);

                // Run custom callback
                if (_.isFunction(error)) {
                    error.call(this, this, jqXHR, options);
                }
            }, context),

            done = _.bind(function () {
                // Prevent request duplication
                if (_.isUndefined(this._xhrCache)) {
                    // Call native "sync"
                    this._xhrCache = sync.call(this, 'read', context, options);
                } else {
                    this._xhrCache.then(deferred.resolve, deferred.reject);
                }
            }, context);

        // Wrap native callbacks
        _.extend(options, {
            complete: _.wrap(options.complete, complete),
            success: _.wrap(options.success, success),
            error: _.wrap(options.error, error)
        });

        var associations, deferreds = [];

        // Resolve associations
        if (this instanceof Backbone.Model) {
            associations = this.associations;
        } else if (this instanceof Backbone.Collection) {
            associations = this.model.prototype.associations;
        }

        // Fetch associated collections if needed
        if (_.isArray(associations)) {
            _.each(associations, function (options) {
//                var relations = _.pick(options, ['belongsTo', 'hasOne', 'hasMany']),
//                    // Association type (first in the set)
//                    type = _.keys(relations)[0],
//                    // Associated collection
//                    collection = _.result(relations, type);
//
//                deferreds.push(collection.fetch());
            });
        }

        // Attach "done" callback
        $.when.apply($, deferreds).then(done);

        return deferred.promise();
    });
}());
