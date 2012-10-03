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

    window.users = new Users([{
        "id": 1
    }, {
        "id": 2
    }]);

    window.mailboxes = new Mailboxes([{
        "id": 1,
        "userId": 1
    }, {
        "id": 2,
        "userId": 2
    }]);

    window.messages = new Messages([{
        "id": 1,
        "mailboxId": 1
    }, {
        "id": 2,
        "mailboxId": 2
    }]);
}());
