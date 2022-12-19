import React from 'react'

const TextInput = ({ label, id, type, register, ...input_props }) => {
  return (
    <div className='w-full'>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1">
        <input 
          type={type || "text"} 
          name={id} 
          id={id}
          className="block w-full px-2 py-1 text-sm font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded-md transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
          {...register(id)}
          {...input_props} />
      </div>
    </div>
  )
}

export default TextInput