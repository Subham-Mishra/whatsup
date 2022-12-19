import React, { useRef, useEffect } from 'react'
import SendMessage from "../components/SendMessage";
import { capitalizeFirstLetter } from "../utils/common"
import { RiCheckFill, RiCheckDoubleFill } from "react-icons/ri";

const ChatSection = ({ chatWith, sortedMessagesToDisplay, sendMessage }) => {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [sortedMessagesToDisplay]);

  return (
    <>
      {chatWith ? (
        <div className="w-9/12 rounded-md" >
          <div className="bg-gray-100 py-2 px-3 flex flex-row justify-between items-center">
            <div className="flex items-center">
              <img className="w-9 h-9 rounded-full" src="https://darrenjameseeley.files.wordpress.com/2014/09/expendables3.jpeg" alt="profile-pic" />
              <p className="text-gray-800 text-sm ml-4">
                {capitalizeFirstLetter(chatWith)}
              </p>
            </div>
          </div>
          <div style={{ backgroundColor: "#DAD3CC" }}>
            <div class="overflow-auto py-2 px-3" style={{ height: "32rem" }}>
              <div className='flex justify-center'>
                <p className="rounded py-2 px-4 text-xs my-4" style={{ backgroundColor: "#FCF4CB" }}>
                  Messages to this chat and calls are now secured with end-to-end encryption. Tap for more info.
                </p>
              </div>
              {sortedMessagesToDisplay?.map((eachMsg) => {
                return (
                  <div className={eachMsg?.is_received ? "flex mb-2" : "flex mb-2 justify-end"}>
                    <div className="rounded py-2 px-3" style={{ backgroundColor: "#F2F2F2" }}>
                      <div className="text-sm">
                        {eachMsg?.content}
                      </div>
                      <div className="text-right text-xs text-gray-500 mt-1 flex">
                        12:45 pm
                        {eachMsg?.to === chatWith && <div>
                          <spam>{eachMsg?.status === "sent" && <RiCheckFill className='h-4 w-5' />}</spam>
                          <spam>
                            {eachMsg?.status === "delivered" && <RiCheckDoubleFill className='h-4 w-5' />}
                          </spam>
                          <spam>{eachMsg?.status === "read" && <RiCheckDoubleFill className='h-4 w-5 text-blue-500' />}</spam>
                        </div>}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="w-full p-2 px-4 py-4 flex items-center" style={{ backgroundColor: "#DAD3CC" }}>
              <SendMessage sendMessage={sendMessage} />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-9/12 bg-blue-400 relative" />
      )}
    </>
  )
}

export default ChatSection