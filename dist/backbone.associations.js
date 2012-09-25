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

            if (options.associations) {
                // Include associated data
            }

            return attributes;
        })
    });

    var Collection = Backbone.Collection;

    _.extend(Collection.prototype, {});

    var BelongsTo = Backbone.BelongsTo = function (storage) {

    };

    _.extend(BelongsTo.prototype, {});

    var HasMany = Backbone.HasMany = function (storage) {

    };

    _.extend(HasMany.prototype, {});

    var HasOne = Backbone.HasOne = function (storage) {

    };

    _.extend(HasOne.prototype, {});

    Backbone.sync = _.wrap(Backbone.sync, function (sync, method, storage, options) {
        // Check for current method
        if (method !== 'read') {
            return sync.call(this, method, storage, options);
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
            }, this),

            success = _.bind(function (success, data, textStatus, jqXHR) {
                // Resolve deferred call
                deferred.resolve(data, textStatus, jqXHR);

                // Perform custom callback function
                if (_.isFunction(success)) {
                    success.call(this, this, data, options);
                }
            }, this),

            error = _.bind(function (error, jqXHR, textStatus, errorThrown) {
                // Reject deferred call
                deferred.reject(jqXHR, textStatus, errorThrown);

                // Perform custom callback function
                if (_.isFunction(error)) {
                    error.call(this, this, jqXHR, options);
                }
            }, this),

            done = _.bind(function () {
                // Prevent request duplication
                if (_.isUndefined(this._xhrCache)) {
                    this._xhrCache = sync.call(this, 'read', storage, options);
                } else {
                    this._xhrCache.then(deferred.resolve, deferred.reject);
                }
            }, this);

        // Wrap custom callbacks
        _.extend(options, {
            complete: _.wrap(options.complete, complete),
            success: _.wrap(options.success, success),
            error: _.wrap(options.error, error)
        });

        // Fetch associated collections
        //    Middleware.Associations.fetch(deferreds, this);

        // Handle deferreds
        $.when.apply($, deferreds).then(done);

        return deferred.promise();
    });
}());

(function () {
    'use strict';

    var BelongsTo = Backbone.BelongsTo = function (store) {

    };

    _.extend(BelongsTo.prototype, {});
}());

(function () {
    'use strict';

    var Collection = Backbone.Collection;

    _.extend(Collection.prototype, {});
}());

(function () {
    'use strict';

    var HasMany = Backbone.HasMany = function (store) {

    };

    _.extend(HasMany.prototype, {});
}());

(function () {
    'use strict';

    var HasOne = Backbone.HasOne = function (store) {

    };

    _.extend(HasOne.prototype, {});
}());

Backbone.sync = _.wrap(Backbone.sync, function (sync, method, storage, options) {
    // Check for current method
    if (method !== 'read') {
        return sync.call(this, method, storage, options);
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
        }, this),

        success = _.bind(function (success, data, textStatus, jqXHR) {
            // Resolve deferred call
            deferred.resolve(data, textStatus, jqXHR);

            // Perform custom callback function
            if (_.isFunction(success)) {
                success.call(this, this, data, options);
            }
        }, this),

        error = _.bind(function (error, jqXHR, textStatus, errorThrown) {
            // Reject deferred call
            deferred.reject(jqXHR, textStatus, errorThrown);

            // Perform custom callback function
            if (_.isFunction(error)) {
                error.call(this, this, jqXHR, options);
            }
        }, this),

        done = _.bind(function () {
            // Prevent request duplication
            if (_.isUndefined(this._xhrCache)) {
                this._xhrCache = sync.call(this, 'read', storage, options);
            } else {
                this._xhrCache.then(deferred.resolve, deferred.reject);
            }
        }, this);

    // Wrap custom callbacks
    _.extend(options, {
        complete: _.wrap(options.complete, complete),
        success: _.wrap(options.success, success),
        error: _.wrap(options.error, error)
    });

    // Fetch associated collections
//    Middleware.Associations.fetch(deferreds, this);

    // Handle deferreds
    $.when.apply($, deferreds).then(done);

    return deferred.promise();
});
