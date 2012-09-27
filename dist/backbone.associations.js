/**
 * Backbone.Associations v0.1.0
 * https://github.com/DreamTheater/Backbone.Associations
 *
 * Copyright © 2012 Dmytro Nemoga
 * Released under the MIT license.
 */

(function () {
    'use strict';

    Backbone.Associations = {};

    /**
     * @class Backbone.Associations.BelongsTo
     */
    var BelongsTo = Backbone.Associations.BelongsTo = {};

    _.extend(Backbone.Associations.BelongsTo = function (storage) {

    }, BelongsTo, {
        prototype: _.extend(BelongsTo.prototype, {

        })
    });

    /**
     * @class Backbone.Associations.HasMany
     */
    var HasMany = Backbone.Associations.HasMany = {};

    _.extend(Backbone.Associations.HasMany = function (storage) {

    }, HasMany, {
        prototype: _.extend(HasMany.prototype, {

        })
    });

    /**
     * @class Backbone.Associations.HasOne
     */
    var HasOne = Backbone.Associations.HasOne = {};

    _.extend(Backbone.Associations.HasOne = function (storage) {

    }, HasOne, {
        prototype: _.extend(HasOne.prototype, {

        })
    });

    /**
     * @class Backbone.Model
     */
    var Model = Backbone.Model;

    _.extend(Backbone.Model = function () {
        Model.apply(this, arguments);
    }, Model, {
        prototype: _.extend(Model.prototype, {
            belongsTo: {},

            hasMany: {},

            hasOne: {},

            toJSON: _.wrap(Model.prototype.toJSON, function (toJSON, options) {
                // Ensure options
                options = _.extend({
                    associations: false
                }, options);

                var attributes = toJSON.call(this, options);

//                if (options.associations) {
//
//                }

                return attributes;
            })
        })
    });

    /**
     * @function Backbone.sync
     */
    Backbone.sync = _.wrap(Backbone.sync, function (sync, method, context, options) {
        // Run native "sync" for all methods except "read"
        if (method !== 'read') {
            return sync.call(this, method, context, options);
        }

        // Ensure options
        options = _.extend({}, options);

        var deferred = $.Deferred(), deferreds = [],

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
                    // Run native "sync"
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

        // Fetch associated collections

        // Handle deferreds
        $.when.apply($, deferreds).then(done);

        return deferred.promise();
    });
}());
