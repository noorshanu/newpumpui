import DefaultLayout from '@/components/Layouts/DefaultLayout'
import LockForm from '@/components/LockForm'
import React from 'react'

function page() {
  return (
    <DefaultLayout>
        <div className=' pb-[30%] sm:pb-[18%]'>
        
            <LockForm contractAddress="0x36Fd6584755F9d9a049d0EEE23C7C4B27A37FaEa"/>
        </div>
    </DefaultLayout>
  )
}

export default page