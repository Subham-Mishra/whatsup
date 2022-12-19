import React from 'react'
import moment from "moment";
import {capitalizeFirstLetter} from "../utils/common"

const ActiveUser = ({ users, user, setChatWith }) => {
  return (
    <div>
      <div className='text-md font-semibold text-gray-800 mt-4 mb-2'>Chats</div>
      {users.map(
        (activeUser) =>
          activeUser?.user_id !== user?.user_id && (<div
            onClick={() => setChatWith(activeUser?.user_id)}
            key={activeUser?.user_id}
            className="rounded-sm border-b border-grey-lighter py-2 bg-white pl-1 flex items-center w-full justify-start hover:bg-gray-100 cursor-pointer">
            <div>
              <img class="h-9 w-9 rounded-full"
                src="https://www.famousbirthdays.com/headshots/russell-crowe-6.jpg" />
            </div>
            <div class="ml-4 flex-1">
              <div class="flex items-bottom justify-between">
                <div class="text-grey-darkest">
                  <div
                    className="cursor-pointer flex flex-col items-start"
                  >
                    <div className='text-sm font-medium'> {capitalizeFirstLetter(activeUser?.user_id)}</div>
                    <div> {activeUser?.is_online ? (<div className='flex gap-2 items-center'>
                      <div className='text-xs font-normal'>online</div>
                      <div className="h-3 w-3 rounded-full bg-green-600" />
                    </div>
                    ) : (
                      <div className='text-xs font-normal'>
                        last seen {" "}
                        {moment(
                          Date.parse(activeUser?.last_online) ||
                          new Date()
                        ).fromNow()}
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>))}
    </div >
  )
}

export default ActiveUser