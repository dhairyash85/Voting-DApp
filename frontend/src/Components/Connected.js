import React from 'react'

const Connected = (props) => {
  return (
    <div className="connected-container">
        <h1 className="connected-header">You are Connected</h1>
        <p className='connected-account'>Account: {props.account}</p>
        <p className='connected-account'>Remaining Time: {props.remainingTime }</p>
    </div>
  )
}

export default Connected