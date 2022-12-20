import { useEffect, useState } from "react";
import { db } from "./utils/firebase";
import {
  set,
  onValue,
  ref,
  update,
  push,
  query,
  orderByChild,
} from "firebase/database";
import { findObjectByID } from "./utils/common";
import LoginView from "./components/LoginView";
import ActiveUser from "./components/ActiveUser";
import UserInfo from "./components/UserInfo";
import ChatSection from "./components/ChatSection";

const App = () => {
  const [user, setUser] = useState({
    user_id: "",
    is_online: false,
    sent_messages: [],
    received_messages: [],
    last_online: "",
  });

  const [users, setUsers] = useState([]);
  const [chatWith, setChatWith] = useState();
  const [currUserMessages, setCurrUserMessages] = useState([]);
  const [messagesToDisplay, setMessagesToDisplay] = useState([]);

  // useEffect(() => {
  //   window.addEventListener("unload", (e) => {
  //     e.preventDefault();
  //     logoutUser();
  //   });
  //   return () => {
  //     window.removeEventListener("unload", (e) => {
  //       e.preventDefault();
  //       logoutUser();
  //     });
  //   };
  // });

  useEffect(() => {
    onValue(ref(db), (snapshot) => {
      setUsers([]);
      setCurrUserMessages([]);
      const data = snapshot.val();
      if (data !== null) {
        Object.values(data.users || {}).forEach((thisUser) => {
          setUsers((prevUsers) => [...prevUsers, thisUser]);
        });
        Object.values(data.messages || {}).forEach((thisUserMessage) => {
          setCurrUserMessages((prevUserMessages) => [
            ...prevUserMessages,
            thisUserMessage,
          ]);
        });
      }
    });
  }, []);

  useEffect(() => {
    setMessagesToDisplay([]);
    Object.keys(currUserMessages).forEach((msgObj) => {
      Object.entries(currUserMessages[msgObj]).forEach(([key, message]) => {
        const msgReceived =
          message.from === chatWith && message.to === user?.user_id;
        const msgSent =
          message.to === chatWith && message.from === user?.user_id;
        if (msgSent || msgReceived) {
          setMessagesToDisplay((messagesToDisplay) => [
            ...messagesToDisplay,
            { ...message, is_received: msgReceived },
          ]);
        }
        if (message.to === user?.user_id && message.from === chatWith) {
          update(
            ref(db, `/messages/${[user?.user_id, chatWith].sort().join("")}`),
            {
              [key]: {
                ...message,
                status: "read",
              },
            }
          );
        }
        if (
          message.from !== chatWith &&
          findObjectByID(users, message?.to)?.is_online &&
          message?.status === "sent"
        ) {
          update(
            ref(
              db,
              `/messages/${[message?.to, message?.from].sort().join("")}`
            ),
            {
              [key]: {
                ...message,
                status: "delivered",
              },
            }
          );
        }
      });
    });
  }, [currUserMessages, chatWith, user?.user_id, users]);

  useEffect(() => {
    if (user.user_id) {
      const existingUserData = users?.find(
        (thisUser) => thisUser?.user_id === user.user_id
      );
      setUser({
        ...existingUserData,
      });
    }
  }, [users, user.user_id]);

  const loginUser = ({ user_id }) => {
    const doesUserExists = !!findObjectByID(users, user_id);
    doesUserExists
      ? update(ref(db, `/users/${user_id}`), { is_online: true })
          .then(() => {
            const existingUserData = users?.find(
              (thisUser) => thisUser?.user_id === user_id
            );
            setUser({
              ...existingUserData,
              is_online: true,
              last_online: new Date(),
            });
          })
          .catch((err) => {
            console.log("Error:", err);
          })
      : set(ref(db, `/users/${user_id}`), {
          user_id,
          is_online: true,
          sent_messages: [],
          received_messages: [],
          last_online: new Date(),
        })
          .then(() => {
            setUser({
              user_id,
              is_online: true,
              sent_messages: [],
              received_messages: [],
              last_online: new Date(),
            });
          })
          .catch((err) => {
            console.log("Error:", err);
          });
  };

  const logoutUser = () => {
    update(ref(db, `/users/${user.user_id}`), {
      is_online: false,
      last_online: new Date(),
    })
      .then(() => {
        setUser({
          user_id: "",
          is_online: false,
          sent_messages: [],
          received_messages: [],
          last_online: new Date(),
        });
        setCurrUserMessages([]);
      })
      .catch((err) => {
        console.log("Error:", err);
      });
  };

  const sendMessage = ({ message_to_send }) => {
    if (!message_to_send || !chatWith) {
      console.log("Message or Receiver info missing");
      return;
    }
    const newMessageRef = push(
      query(
        ref(db, `/messages/${[user?.user_id, chatWith].sort().join("")}`),
        orderByChild("timestamp")
      )
    );
    set(newMessageRef, {
      to: chatWith,
      from: user?.user_id,
      content: message_to_send,
      status: "sent",
      timestamp: new Date(),
    });
  };

  return user.is_online ? (
    <div
      id="user_view"
      className="flex gap-2 w-screen h-screen p-16 rounded-md"
    >
      <div className="w-3/12">
        <UserInfo user={user} logoutUser={logoutUser} />
        <ActiveUser users={users} user={user} setChatWith={setChatWith} />
      </div>
      <div className="w-9/12">
        <ChatSection
          sendMessage={sendMessage}
          chatWith={chatWith}
          messagesToDisplay={messagesToDisplay}
        />
      </div>
    </div>
  ) : (
    <LoginView loginUser={loginUser} />
  );
};

export default App;
