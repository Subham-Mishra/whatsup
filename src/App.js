import { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import moment from "moment";
import { v4 as uuid } from "uuid";
import { db } from "./utils/firebase";
import { set, remove, onValue, ref, update } from "firebase/database";
import Button from "./components/Button";
import TextInput from "./components/TextInput";

const App = () => {
  const { register, handleSubmit, setValue } = useForm();

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

    setValue("message_to_send", "");
  };

  return (
    <div className="grid place-content-center h-screen">
      {user.is_online ? (
        <div id="user_view">
          <div className="flex gap-2 w-screen h-screen p-16">
            <div className="w-1/5 bg-red-500">
              <div className="flex justify-between ">
                <div className="text-sm font-medium text-gray-700">
                  Hi {user.user_id}
                </div>
                <Button text="Log out" onClick={logoutUser} />
              </div>
              <div>
                Active users:
                <div>
                  {users.map(
                    (activeUser) =>
                      activeUser?.user_id !== user?.user_id && (
                        <div
                          onClick={() => setChatWith(activeUser?.user_id)}
                          key={activeUser?.user_id}
                          className="py-2 pl-6 cursor-pointer flex gap-2 items-center"
                        >
                          - {activeUser?.user_id}{" "}
                          {activeUser?.is_online ? (
                            <div className="h-4 w-4 rounded-full bg-green-600" />
                          ) : (
                            <div>
                              Last Online:{" "}
                              {moment(
                                Date.parse(activeUser?.last_online) ||
                                  new Date()
                              ).fromNow()}
                            </div>
                          )}
                        </div>
                      )
                  )}
                </div>
              </div>
            </div>
            {chatWith ? (
              <div className="w-4/5 bg-blue-400 relative">
                Chatting With {chatWith}
                <div>
                  {sortedMessagesToDisplay?.map((eachMsg) => {
                    return (
                      <p
                        className={
                          eachMsg?.is_received ? "" : "text-end" + " w-full"
                        }
                      >
                        {eachMsg?.content} -
                        <spam>{eachMsg?.status === "sent" && "Sent"}</spam>
                        <spam>
                          {eachMsg?.status === "delivered" && "Delivered"}
                        </spam>
                        <spam>{eachMsg?.status === "read" && "Read"}</spam>
                      </p>
                    );
                  })}
                </div>
                <div className="absolute bottom-0 w-full p-2">
                  <form
                    onSubmit={handleSubmit(sendMessage)}
                    className="flex gap-2 items-end w-full"
                  >
                    <TextInput
                      id="message_to_send"
                      label="Enter Message"
                      register={register}
                    />
                    <Button type="submit" text="Send" />
                  </form>
                </div>
              </div>
            ) : (
              <div className="w-4/5 bg-blue-400 relative" />
            )}
          </div>
        </div>
      ) : (
        <div id="login_view">
          <form onSubmit={handleSubmit(loginUser)} className="grid gap-8">
            <TextInput
              id="user_id"
              label="Enter user-name"
              register={register}
              required
            />
            <Button type="submit" text="Log in" />
          </form>
        </div>
      )}
    </div>
  );
};

export default App;
