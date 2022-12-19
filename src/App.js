import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuid } from "uuid";
import { db } from "./utils/firebase";
import { set, onValue, ref, update } from "firebase/database";
import LoginView from "./components/LoginView";
import ActiveUser from "./components/ActiveUser";
import UserInfo from "./components/UserInfo";
import ChatSection from "./components/ChatSection";

const App = () => {
  const { setValue } = useForm();

  const [user, setUser] = useState({
    user_id: "",
    is_online: false,
    sent_messages: [],
    received_messages: [],
    last_online: "",
  });
  const [currUserMessages, setCurrUserMessages] = useState([]);
  const [messagesToDisplay, setMessagesToDisplay] = useState([]);
  const [users, setUsers] = useState([]);
  const [chatWith, setChatWith] = useState();
  const [sortedMessagesToDisplay, setSortedMessagesToDisplay] =
    useState(messagesToDisplay);
  const getUserInfo = (id) =>
    users.find((thisUser) => thisUser?.user_id === id);

  useEffect(() => {
    setSortedMessagesToDisplay(
      [...messagesToDisplay].sort(
        (a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp)
      )
    );
  }, [messagesToDisplay]);

  useEffect(() => {
    onValue(ref(db), (snapshot) => {
      setUsers([]);
      setCurrUserMessages([]);
      const data = snapshot.val();
      if (data !== null) {
        Object.values(data.users || {}).map((thisUser) => {
          setUsers((prevUsers) => [...prevUsers, thisUser]);
        });
        Object.values(data.messages || {}).map((thisUserMessage) => {
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
      Object.values(currUserMessages[msgObj]).map((message) => {
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
        const { msgid } = message;
        if (message.to === user?.user_id) {
          if (message.from === chatWith) {
            update(
              ref(db, `/messages/${[user?.user_id, chatWith].sort().join("")}`),
              {
                [msgid]: {
                  ...message,
                  status: "read",
                },
              }
            );
          }
        } else {
          if (
            getUserInfo(message?.to)?.is_online &&
            message?.status === "sent"
          ) {
            update(
              ref(
                db,
                `/messages/${[message?.to, message?.from].sort().join("")}`
              ),
              {
                [msgid]: {
                  ...message,
                  status: "delivered",
                },
              }
            );
          }
        }
      });
    });
  }, [currUserMessages, chatWith, user?.user_id]);

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
    const doesUserExists = !!users?.filter((user) => user.user_id === user_id)
      .length;
    if (doesUserExists) {
      update(ref(db, `/users/${user_id}`), { is_online: true })
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
        });
    } else {
      set(ref(db, `/users/${user_id}`), {
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
    }
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
    const uid = uuid();
    update(ref(db, `/messages/${[user?.user_id, chatWith].sort().join("")}`), {
      [uid]: {
        msgid: uid,
        to: chatWith,
        from: user?.user_id,
        content: message_to_send,
        status: "sent",
        timestamp: new Date(),
      },
    });
  };

  return (
    <div className="grid place-content-center h-screen">
      {user.is_online ? (
        <div id="user_view">
          <div className="flex gap-2 w-screen h-screen p-16">
            <div className="w-3/12 ">
              <UserInfo
                user={user}
                logoutUser={logoutUser}
                setChatWith={setChatWith}
              />
              <ActiveUser users={users} user={user} setChatWith={setChatWith} />
            </div>
            <ChatSection
              sendMessage={sendMessage}
              chatWith={chatWith}
              sortedMessagesToDisplay={sortedMessagesToDisplay}
            />
          </div>
        </div>
      ) : (
        <LoginView loginUser={loginUser} />
      )}
    </div>
  );
};

export default App;
