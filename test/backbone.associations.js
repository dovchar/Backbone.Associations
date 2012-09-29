(function () {
    'use strict';

    var User = Backbone.Model.extend({
        associations: [{
            hasOne: function () {
                return window.mailboxes;
            },

            as: 'Mailbox',
            by: 'userId'
        }]
    });

    var Mailbox = Backbone.Model.extend({
        associations: [{
            hasMany: function () {
                return window.messages;
            },

            as: 'Messages',
            by: 'mailboxId'
        }]
    });

    var Message = Backbone.Model.extend({
        associations: [{
            belongsTo: function () {
                return window.mailboxes;
            },

            as: 'Mailbox',
            by: 'mailboxId'
        }]
    });

    var Users = Backbone.Collection.extend({
        model: User, url: 'users.json'
    });

    var Mailboxes = Backbone.Collection.extend({
        model: Mailbox, url: 'mailboxes.json'
    });

    var Messages = Backbone.Collection.extend({
        model: Message, url: 'messages.json'
    });

    window.users = new Users();
    window.mailboxes = new Mailboxes();
    window.messages = new Messages();

    window.messages.fetch();
}());
