import React from 'react'
import Button from "../atoms/Button";
import { capitalizeFirstLetter } from '../utils/common';

const UserInfo = ({ user, logoutUser }) => {
  return (
      <div className="flex justify-between ">
        <div className="text-base font-medium text-gray-900">
          Hi {capitalizeFirstLetter(user.user_id)}
        </div>
        <Button
          text="Log out"
          onClick={logoutUser}
        />
      </div>
  )
}

export default UserInfo