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
}());
