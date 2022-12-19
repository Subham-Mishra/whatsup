import React from 'react'
import { useForm } from "react-hook-form";
import TextInput from '../atoms/TextInput'
import Button from '../atoms/Button'

const LoginView = ({loginUser}) => {
  const { register, handleSubmit } = useForm();

  return (
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
  )
}

export default LoginView