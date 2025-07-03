import { UserProfile } from '@clerk/nextjs'
import React from 'react'

const user = () => {
  return (
    <div className='flex justify-center items-center mt-10'>
      <UserProfile/>
    </div>
  )
}

export default user
