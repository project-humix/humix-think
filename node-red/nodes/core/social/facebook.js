var request = require('request')

module.exports = function(RED) {
  function FacebookMessageInNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    // For webhook setup
    RED.httpNode.get('/fb/webhook', function (req, res) {
      if (req.query['hub.verify_token'] === 'my_happy_is_my_password_joeyts') {
        res.send(req.query['hub.challenge']);
      }
      res.send('Error, wrong validation token');
    });

    // Handle messages sent by a certain sender
    RED.httpNode.post('/fb/webhook', function (req, res) {
      messaging_events = req.body.entry[0].messaging;

      for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i];
        senderID = event.sender.id;
        node.log("Receiving messages from sender: " + senderID);

        if (event.message && event.message.text) {
          messageText = event.message.text;
          node.log("Receiving message text: " + messageText);

          node.send({
              facebook: {
                  sender: senderID || undefined,
                  //messageId: response.body.data[i].messages.data[l].id || undefined,
                  //conversationId: response.body.data[i].id || undefined,
                  type: "message",
                  //pageName: page_name || undefined,
                  pageId: config.pageId,
                  accessToken: config.accessToken
              },
              payload: messageText || ''
          });
        }
      }
      res.sendStatus(200);
    });
  }

  RED.nodes.registerType('facebook message in', FacebookMessageInNode);

  function FacebookMessageOutNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    // Send out text message
    function sendTextMessage(sender, text, token) {
      messageData = {
        text:text
      }

      request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
          recipient: {id:sender},
          message: messageData,
        }
      }, function(error, response, body) {
        if (error) {
          node.log('Error sending text message: ', error);
        } else if (response.body.error) {
          node.log('Error: ', response.body.error);
        }
      });
    }

    node.on('input', function(msg) {
        if (!msg.payload) {
            node.error('Missing property!');
            return;
        }

        node.log("Sending back message: \"" + msg.payload + "\" to sender: " + msg.facebook.sender);
        sendTextMessage(msg.facebook.sender, msg.payload, msg.facebook.accessToken);
        });
    }

    RED.nodes.registerType('facebook message out', FacebookMessageOutNode);
}
