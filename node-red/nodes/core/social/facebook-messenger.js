var request = require('request');

// facebook constants
var FB_MSG_URL = 'https://graph.facebook.com/v2.6/me/messages',
    FB_CHANNEL = 'messenger';

module.exports = function(RED) {
  function FBMessengerInNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    // For webhook setup
    RED.httpNode.get(config.webhookURI, function (req, res) {
      if (req.query['hub.verify_token'] === config.verifyToken) {
        res.send(req.query['hub.challenge']);
      }
      res.send('Error, wrong validation token');
    });

    // Handle messages sent by a certain sender
    RED.httpNode.post(config.webhookURI, function (req, res) {
      messaging_events = req.body.entry[0].messaging;
      node.log("Receiving " + messaging_events.length + " message event(s).");

      for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i];
        senderId = event.sender.id;
        node.log("Receiving messages from sender: " + senderId);

        if (event.message && event.message.text) {
          messageText = event.message.text;
          node.log("Receiving message text: " + messageText);

          node.send({
            facebook: {
              channel: FB_CHANNEL,
              peerId: senderId || undefined,
              msgType: 'text',
              msgText: messageText,
              msgImageURL: null,
              msgTemplate: null
            }
          });
        }
      }

      res.sendStatus(200);
    });
  }

  RED.nodes.registerType('fb messenger in', FBMessengerInNode);

  function FBMessengerOutNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    var token = config.accessToken;

    // Send out text message (of msgType: text)
    function sendTextMessage(recipientId, textToSend, token) {
      textMessageData = {
        text:textToSend
      }
      request({
        url: FB_MSG_URL,
        qs: {access_token:token},
        method: 'POST',
        json: {
          recipient: {id:recipientId},
          message: textMessageData,
        }
      }, function(error, response, body) {
        if (error) {
          node.log('Error sending text message: ', error);
        } else if (response.body.error) {
          node.log('Error: ', response.body.error);
        }
      });
    }

    // Send out image message (of msgType: image)
    function sendImageMessage(recipientId, imageURL, token) {
      imageMessageData = {
        attachment:{
          type:"image",
          payload:{
            url:imageURL
          }
        }
      }
      request({
        url: FB_MSG_URL,
        qs: {access_token:token},
        method: 'POST',
        json: {
          recipient: {id:recipientId},
          message: imageMessageData,
        }
      }, function(error, response, body) {
        if (error) {
          node.log('Error sending iamge message: ', error);
        } else if (response.body.error) {
          node.log('Error: ', response.body.error);
        }
      });
    }

    /*
    // Send template message (of msgType: template)
    function sendGenericMessage(senderID, token) {
      messageData = {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "generic",
            "elements": [{
              "title": "Happy Sisters",
              "subtitle": "Hello! We are Cassie & Carol...^*^",
              "image_url": "https://scontent-tpe1-1.xx.fbcdn.net/t31.0-8/12768270_458285081031813_2892015393138421467_o.jpg",
              "buttons": [{
                "type": "web_url",
                "url": "https://www.facebook.com/Humix-Happy-458283964365258",
                "title": "Go to Humix Happy Facebook page"
              }],
            }]
          }
        }
      };
      request({
        url: FB_MSG_URL,
        qs: {access_token:token},
        method: 'POST',
        json: {
          recipient: {id:senderID},
          message: messageData,
        }
      }, function(error, response, body) {
        if (error) {
          node.log('Error sending message: ', error);
        } else if (response.body.error) {
          node.log('Error: ', response.body.error);
        }
      });
    }
    */

    node.on('input', function(msg) {
      node.log("Received msg object is " + JSON.stringify(msg));
      if (msg.facebook.msgType == "text") {
        node.log("Sending text message: \"" + msg.facebook.msgText + "\" to recipientId: " + msg.facebook.peerId);
        sendTextMessage(msg.facebook.peerId, msg.facebook.msgText, token);
      }
      else if (msg.facebook.msgType == "image") {
        node.log("Sending image message: \"" + msg.facebook.msgImageURL + "\" to recipient: " + msg.facebook.peerId);
        sendImageMessage(msg.facebook.peerId, msg.facebook.msgImageURL, token);
      } /*else if (msg.facebook.msgType == "template") {
        node.log("Sending template message to recipient: " + msg.facebook.peerId);
        sendGenericMessage(msg.facebook.peerId, token);
      }*/
    });
  }

  RED.nodes.registerType('fb messenger out', FBMessengerOutNode);
}
