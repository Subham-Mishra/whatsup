This is a Whatsapp clone built using ReactJS, Tailwind and Firebase.

Its supports P2P (one on one, not group) chat using Firebase Realtime database.

Deployed to Firebase.

Functionalities:
1. list active users who are online
2. message send (single tick like WhatsApp) 
3. message delivery notification (double tick like WhatsApp)
4. message read notification (blue double tick like WhatsApp)
5. use Firebase Auth for login


Structure of user object
{
  user_id: "",
  is_online: "",
  sent_messages: [{
      to: user_id,
      messages: [{
          content: "Hey",
          is_delivered: true,
          is_received: true,
          is_read: false
        }
      ]
    }
  ]
  received_messages: [{
      from: user_id,
      messages: [{
          content: "Hey",
          is_delivered: true,
          is_received: true,
          is_read: false
        }
      ]
    }
  ]
}