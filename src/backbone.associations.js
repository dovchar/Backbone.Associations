(function () {
    'use strict';

    Backbone.Associations = {};

    /**
     * Backbone.Associations.BelongsTo
     */
    var BelongsTo = Backbone.Associations.BelongsTo = function (storage) {

    };

    _.extend(BelongsTo.prototype, {

    });

    /**
     * Backbone.Associations.HasMany
     */
    var HasMany = Backbone.Associations.HasMany = function (storage) {

    };

    _.extend(HasMany.prototype, {

    });

    /**
     * Backbone.Associations.HasOne
     */
    var HasOne = Backbone.Associations.HasOne = function (storage) {

    };

    _.extend(HasOne.prototype, {

    });

    /**
     * Backbone.Model
     */
    var Model = Backbone.Model;

    _.extend(Model.prototype, {
        belongsTo: {},

        hasMany: {},

        hasOne: {},

        toJSON: _.wrap(Model.prototype.toJSON, function (toJSON, options) {
            // Ensure options
            options = _.extend({
                associations: false
            }, options);

            var attributes = toJSON.call(this, options);

//            if (options.associations) {
//
//            }

            return attributes;
        })
    });

    /**
     * Backbone.sync
     */
    Backbone.sync = _.wrap(Backbone.sync, function (sync, method, context, options) {
        // Check for current method
        if (method !== 'read') {
            return sync.call(this, method, context, options);
        }

        // Ensure options
        options = _.extend({}, options);

        var deferred = $.Deferred(), deferreds = [],

            complete = _.bind(function (complete, jqXHR, textStatus) {
                // Clear XHR cache
                delete this._xhrCache;

                // Perform custom callback function
                if (_.isFunction(complete)) {
                    complete.call(this, this, jqXHR, textStatus);
                }
            }, context),

            success = _.bind(function (success, data, textStatus, jqXHR) {
                // Resolve deferred call
                deferred.resolve(data, textStatus, jqXHR);

                // Perform custom callback function
                if (_.isFunction(success)) {
                    success.call(this, this, data, options);
                }
            }, context),

            error = _.bind(function (error, jqXHR, textStatus, errorThrown) {
                // Reject deferred call
                deferred.reject(jqXHR, textStatus, errorThrown);

                // Perform custom callback function
                if (_.isFunction(error)) {
                    error.call(this, this, jqXHR, options);
                }
            }, context),

            done = _.bind(function () {
                // Prevent request duplication
                if (_.isUndefined(this._xhrCache)) {
                    this._xhrCache = sync.call(this, 'read', context, options);
                } else {
                    this._xhrCache.then(deferred.resolve, deferred.reject);
                }
            }, context);

        // Wrap custom callbacks
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
