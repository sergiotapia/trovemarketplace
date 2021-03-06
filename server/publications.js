// Rework publications into separate files per Collection.

Meteor.publish('items', function() {
  return Items.find({});
});

Meteor.publish('singleItem', function(itemId) {
  check(itemId, String);
  return Items.find({_id: itemId});
});

Meteor.publish('messages', function(itemId) {
  check(itemId, String);
  return Messages.find({itemId: itemId});
});

Meteor.publish("userStatus", function() {
  Counts.publish(this, 'usersOnline', Meteor.users.find({ "status.online": true }));
});

Meteor.publish('itemsWithSkip', function(skip, limit) {
  check(skip, Number);
  check(limit, Number);
  var options;
  Counts.publish(this, 'total_items', Items.find());
  if (skip < 0) {
    skip = 0;
  }
  options = {};
  options.skip = skip;
  options.limit = limit;
  options.sort = {
    createdAt: -1
  };
  return Items.find({}, options);
});

Meteor.methods({
  newItem: function (item) {
    var user = Meteor.user();
    var itemRecord = _.extend(item, {
      userId: user._id, 
      owner: user.profile.ingameName || user.profile.name, 
      createdAt: new Date()
    });

    check(itemRecord, {
      name: String,
      price: Number,
      description: String,
      userId: String,
      owner: String,
      createdAt: Date
    });

    
    var itemId = Items.insert(itemRecord);
    return { _id: itemId };
  },
  newMessage: function (message) {
    var user = Meteor.user();
    var messageRecord = _.extend(message, {
      userId: user._id, 
      owner: user.profile.ingameName || user.profile.name, 
      createdAt: new Date()
    });

    check(messageRecord, {
      text: String,
      itemId: String,
      userId: String,
      owner: String,
      createdAt: Date
    });
    
    var messageId = Messages.insert(messageRecord);
    
    Items.update(messageRecord.itemId, {
      $inc: { messageCount: 1 }
    });

    return { _id: messageId };
  }
});