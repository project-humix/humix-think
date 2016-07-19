var bodyParser = require('body-parser'),
    needle = require('needle');

var FB_URL = "https://graph.facebook.com/v2.6/";

module.exports = function(RED) {
  function FacebookMessageInNode(config) {
      RED.nodes.createNode(this, config);
      var node = this;

      // Compose conversation URL
      //var convURL = FB_URL + config.pageId + "/conversations?access_token=" + config.accessToken + "&debug=all&format=json&method=get&pretty=0&suppress_http_code=1";
      var convURL = FB_URL + config.pageId + "/conversations?access_token=" + config.accessToken + "&fields=messages,snippet,senders,message_count";
      node.log("The FB URL to get conversations is " + convURL);

      // Remember converstions we already handled
      var convDB = [];
      var page_name = null;
      var first_time = true;
      var new_conversation = true;
      var new_obj = null;
      var stop_getting = false;
      var query_interval = 3000; // millisecond

      function getConversations(curl, callback) {
          needle.get(curl, function(error, response) {
              if (error != null) {
                  node.error("[getConversations]: callback error: "+ error);
              }

              if ((response != null) && (response.body != null) && (response.body.data != null)) {
                  for (var i = 0; i < response.body.data.length; i++) {
                      new_conversation = true;

                      for (var j = 0; j < convDB.length; j++) {
                          // Existing converstions
                          if (response.body.data[i].id == convDB[j].t_id) {
                              var num_msg_to_handle = response.body.data[i].message_count - convDB[j].msg_count;
                              //node.log("[ExistingConv]: The number of messages to send is " + num_msg_to_handle);

                              if (num_msg_to_handle > 0) {
                                  convDB[j].msg_count = response.body.data[i].message_count;

                                  //for (var k = (num_msg_to_handle - 1); k >= 0; k--) {
                                      // Bypass messages that have been handled
                                      //if (response.body.data[i].messages.data[k].from.name != page_name) {
                                      if (response.body.data[i].senders.data[0].name != page_name) {
                                          // Send out the received new message(s) to the next node
                                          node.log("[ExistingConv]: Received message: " + response.body.data[i].snippet);
                                          node.send({
                                              facebook: {
                                                  //sender: response.body.data[i].messages.data[k].from.name || undefined,
                                                  sender: response.body.data[i].senders.data[0].name || undefined,
                                                  //messageId: response.body.data[i].messages.data[k].id || undefined,
                                                  messageId: response.body.data[i].messages.data[0].id || undefined,
                                                  conversationId: response.body.data[i].id || undefined,
                                                  type: "message",
                                                  pageName: page_name || undefined,
                                                  pageId: config.pageId,
                                                  accessToken: config.accessToken
                                              },
                                              //payload: response.body.data[i].messages.data[k].message || ''
                                              payload: response.body.data[i].snippet || ''
                                          });
                                      }
                                  //}
                              }

                new_conversation = false;
                break;
                          }
                      }

          // Create new conversation
                      if (new_conversation) {
                          new_obj = {
                              "t_id": response.body.data[i].id,
                              "msg_count": response.body.data[i].message_count
                          };

                          convDB.push(new_obj);

                          if (!first_time) {
                              //for (var l = (response.body.data[i].messages.data.length - 1); l >= 0; l--) {
                                  //if (response.body.data[i].messages.data[l].from.name != page_name) {
                                  if (response.body.data[i].senders.data[0].name != page_name) {
                                      // Send out the received new message(s) to the next node
                                      //node.log("[NewConv]: Send message (" + response.body.data[i].messages.data[l].message + ")to the next node.");
                                      node.send({
                                          facebook: {
                                              //sender: response.body.data[i].messages.data[l].from.name || undefined,
                                              sender: response.body.data[i].senders.data[0].name || undefined,
                                              //messageId: response.body.data[i].messages.data[l].id || undefined,
                                              messageId: response.body.data[i].messages.data[0].id || undefined,
                                              conversationId: response.body.data[i].id || undefined,
                                              type: "message",
                                              pageName: page_name || undefined,
                                              pageId: config.pageId,
                                              accessToken: config.accessToken
                                          },
                                          payload: response.body.data[i].snippet || ''
                                      });
                                  }
                              //}
                          }
                      }
                  }

                  if (first_time) {
                      first_time = false;
                  }
              }

              if (!stop_getting) {
                  callback();
              }
          });
      }

      function goC(curl) {
          setTimeout(function () {
              getConversations(curl,
                               function() {goC(curl);});
          },  query_interval);
      }

      this.on('close', function() {
          // Stop the loop to get conversations from monitored page
          stop_getting = true;
      });

      // Start to get the conversations from the page
      if (page_name == null) { // Get the page name first
          var url = FB_URL + config.pageId + "/?access_token=" + config.accessToken;

          needle.get(url, function(error, response) {
              if ((response != null) && (response.body != null)) {
                  node.log ("The page name is " + response.body.name);
                  page_name = response.body.name;

                  goC(convURL);
              }
          });
      }
      else {
          goC(convURL);
      }
  }

    RED.nodes.registerType('facebook message in', FacebookMessageInNode);

    function FacebookMessageOutNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', function(msg) {
            //if (!msg.payload || !msg.facebook) {
            if (!msg.payload) {
                node.error('Missing property!');
                return;
            }

            var body = {};
            /*msg.payload.link = undefined;
            if (msg.payload.link) {
                node.log('link: '+msg.payload.link);
                body = {
                    access_token: 'CAAWy4kLZBfyMBAMw8gaOqFHZAdrKd64jUHGblLZBCtUVePaLZBotKy2fZBqudj2WDHXSdqe5vfBc2DIS9uSZACtht1EmLfraHfRmUVy1burdZBmVOQJf2O12pp4ZAR7U7xbzWFlbT6fWAbDsyH6MaD7r3pGRsDBPn6cgbTzVlaGfoO7MnCTzgLZAX',
                    type: 'message',
                    page_id: '816647205082726',
                    message: msg.payload.text || 'Here is your picture',
                    link: msg.payload.link
                };
            } else {*/
                body = {
                    t_id: msg.facebook.conversationId,
                    access_token: msg.facebook.accessToken || config.accessToken,
                    type: msg.facebook.type || config.msgType,
                    page_name: msg.facebook.pageName || '',
                    page_id: msg.facebook.pageId || config.pageId,
                    message: msg.payload || '',
                    imageURL: msg.facebook.msgImageURL || '',
                    link: undefined
                };
            //}

            var encoded_msg = encodeURIComponent(body.message);
            var postURL;

            if (body.type == "message") {
                postURL = FB_URL + body.t_id + "/messages?access_token=" + body.access_token + "&message=" + encoded_msg;
                node.log(body.page_name + ": Reply to " + msg.facebook.sender + " with the message " + "\"" + body.message + "\".");
            } else if (body.type == "post_message") {
                postURL = FB_URL + body.page_id + "/feed?access_token=" + body.access_token + "&message=" + encoded_msg;
                node.log("Post a message to Page: " + body.page_id + " with the message " + "\"" + body.message + "\".");
            } else if (body.type == "post_image") {
                postURL = FB_URL + body.page_id + "/photos?access_token=" + body.access_token + "&url=" + body.imageURL + "&caption=" + encoded_msg;
                node.log("Post URL: " + postURL);
                node.log("Post an image to Page: " + body.page_id + " with the message " + "\"" + body.message + "\".");
            }

            needle.post(postURL, {},
                        function(err, resp, body){/*console.log(err);console.log(res);*/});
        });
    }

    RED.nodes.registerType('facebook message out', FacebookMessageOutNode);
}
