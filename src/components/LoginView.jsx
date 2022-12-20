import React from 'react'
import { useForm } from "react-hook-form";
import TextInput from '../atoms/TextInput'
import Button from '../atoms/Button'

const LoginView = ({loginUser}) => {
  const { register, handleSubmit } = useForm();

  return (
      <form  id="login_view" onSubmit={handleSubmit(loginUser)} className="grid gap-8 place-content-center h-screen">
        <TextInput
          id="user_id"
          label="Enter user-name"
          register={register}
          required
        />
        <Button type="submit" text="Log in" />
      </form>
  )
}

export default LoginView