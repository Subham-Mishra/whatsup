import React from 'react'

const Button = ({ text, type, onClick, ...rest }) => {
  return (<div>
    <button
      type={type || "button"}
      onClick={onClick}
      className="text-sm rounded-md border border-gray-300 bg-white px-2 py-1 text-gray-700 hover:bg-gray-50"
      {...rest}
    >
      {text}
    </button>
  </div>
  )
}

export default Button