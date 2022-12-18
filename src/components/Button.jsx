import React from 'react'

const Button = ({ text, type, onClick, ...rest }) => {
  return (<div>
    <button
      type={type || "button"}
      onClick={onClick}
      className="rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 shadow-sm hover:bg-gray-50"
      {...rest}
    >
      {text}
    </button>
  </div>
  )
}

export default Button