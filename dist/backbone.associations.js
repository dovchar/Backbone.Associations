/**
 * Backbone.Associations v0.2.0
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

        // Configure associations
        this.associations = options.associations || this.associations || [];

        // Create reference to associated models
        _.each(this.associations, function (association) {
            // Relation object (configuration)
            var relation = this.constructor.resolveRelation(association);

            // Create reference methods
            this[relation.type](relation.name, relation);
        }, this);

        // Call original constructor
        Model.apply(this, arguments);
    }, Model, {
        resolveRelation: function (association) {
            // The pairs of "type: collection"
            var relations = _.pick(association, ['belongsTo', 'hasOne', 'hasMany']),
            // Relation type (first in the set)
                type = _.keys(relations)[0],
            // Related collection
                collection = relations[type];

            return {
                // Relation type: "belongsTo", "hasOne" or "hasMany"
                type: type,
                // The instance of related collection (or function to getting it)
                collection: collection,
                // The name of reference (will be prefixed by get/set/build/create)
                name: association.as,
                // The name of attribute that contains ID of associated model
                foreignKey: association.by
            };
        },

        resolveCollection: function (relation) {
            return _.result(relation, 'collection');
        },

        prototype: _.extend(Model.prototype, {
            belongsTo: function (name, relation) {
                return this._createReference(name, relation, {
                    // Getter method
                    getter: function (collection) {
                        var id = this.get(relation.foreignKey);

                        return collection.get(id);
                    },

                    // Setter method
                    setter: function (collection, model, options) {
                        return this.set(relation.foreignKey, model.id, options);
                    },

                    // Builder method
                    builder: function (collection, attributes, options) {
                        var Model = collection.model;

                        return new Model(attributes, options);
                    },

                    // Creator method
                    creator: function (collection, attributes, options) {
                        return collection.create(attributes, options);
                    }
                });
            },

            hasOne: function (name, relation) {
                return this._createReference(name, relation, {
                    // Getter method
                    getter: function (collection) {
                        var attributes = {};

                        // Condition to model identification
                        attributes[relation.foreignKey] = this.id;

                        return collection.where(attributes)[0];
                    },

                    // Setter method
                    setter: function (collection, model, options) {
                        return model.set(relation.foreignKey, this.id, options);
                    },

                    // Builder method
                    builder: function (collection, attributes, options) {
                        var Model = collection.model;

                        return new Model(attributes, options);
                    },

                    // Creator method
                    creator: function (collection, attributes, options) {
                        return collection.create(attributes, options);
                    }
                });
            },

            hasMany: function (name, relation) {
                return this._createReference(name, relation, {
                    // Getter method
                    getter: function (collection) {
                        return collection;
                    }
                });
            },

            toJSON: _.wrap(Model.prototype.toJSON, function (toJSON, options) {
                // Ensure options
                options = _.extend({
                    associations: false
                }, options);

                var attributes = toJSON.call(this, options);

                // if (options.associations) {
                //
                // }

                return attributes;
            }),

            _createReference: function (name, relation, reference) {
                var getter = function (getter) {
                        // Associated collection
                        var collection = this.constructor.resolveCollection(relation);

                        return getter.call(this, collection);
                    },

                    setter = function (setter, model, options) {
                        // Associated collection
                        var collection = this.constructor.resolveCollection(relation);

                        return setter.call(this, collection, model, options);
                    },

                    builder = function (builder, attributes, options) {
                        // Associated collection
                        var collection = this.constructor.resolveCollection(relation);

                        return builder.call(this, collection, attributes, options);
                    },

                    creator = function (creator, attributes, options) {
                        // Associated collection
                        var collection = this.constructor.resolveCollection(relation);

                        return creator.call(this, collection, attributes, options);
                    };

                // Create getAssociation() method
                if (_.isFunction(reference.getter)) {
                    this['get' + name] = _.wrap(reference.getter, getter);
                }

                // Create setAssociation(model, options) method
                if (_.isFunction(reference.setter)) {
                    this['set' + name] = _.wrap(reference.setter, setter);
                }

                // Create buildAssociation(attributes, options) method
                if (_.isFunction(reference.builder)) {
                    this['build' + name] = _.wrap(reference.builder, builder);
                }

                // Create createAssociation(attributes, options) method
                if (_.isFunction(reference.creator)) {
                    this['create' + name] = _.wrap(reference.creator, creator);
                }

                return this;
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

        var complete = _.bind(function (complete, jqXHR, textStatus) {
                // Release the lock
                delete this._locked;

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
            }, context);

        // Wrap native callbacks
        _.extend(options, {
            complete: _.wrap(options.complete, complete),
            success: _.wrap(options.success, success),
            error: _.wrap(options.error, error)
        });

        var deferred = $.Deferred(), deferreds = [], associations,

            done = _.bind(function () {
                sync.call(this, 'read', context, options);
            }, context);

        // Resolve associations
        if (this instanceof Backbone.Model) {
            associations = this.associations;
        } else if (this instanceof Backbone.Collection) {
            associations = this.model.prototype.associations;
        }

        // Load related data
        _.each(associations, function (association) {
            // Relation object (configuration)
            var relation = Backbone.Model.resolveRelation.call(this, association),
                // Related collection
                collection = Backbone.Model.resolveCollection.call(this, relation),

                deferred;

            // Prevent circular dependency
            if (collection !== options.associate) {
                // Fetch related collection
                deferred = collection.fetch({
                    associate: this
                });

                deferreds.push(deferred);
            }
        }, this);

        // Avoid request duplication
        if (!this._locked) {
            // Attach "done" callback
            $.when.apply($, deferreds).then(done);

            // Prevent other requests
            this._locked = true;
        }

        return deferred.promise();
    });
}());
