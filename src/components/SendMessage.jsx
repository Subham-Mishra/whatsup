import React from 'react'
import { useForm } from "react-hook-form";
import TextInput from '../atoms/TextInput'
import Button from '../atoms/Button'

const SendMessage = ({ sendMessage }) => {

  const { register, handleSubmit, setValue } = useForm();

  const sendMessages=(data)=>{
    sendMessage(data)
    setValue("message_to_send", "");
  }
  return (
      <form
        onSubmit={handleSubmit(sendMessages)}
        className="flex gap-2 items-end w-full"
      >
        <TextInput
          id="message_to_send"
          register={register}
        />
        <Button type="submit" text="Send" />
      </form>
  )
}

export default SendMessage