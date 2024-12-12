import React from 'react'
// import SendToken from '../../../components/SendToken'
import DefaultLayout from '@/components/Layouts/DefaultLayout'
import TokenMultiSender from '@/components/TokenMultiSender'

function page() {
  return (
  <>
  <DefaultLayout>
  <div className=' h-[100vh]'>
    <div>
      <h1 className=' py-4 text-white '>
        Send Token Multiple Address
      </h1>
    </div>
        {/* <SendToken/> */}
        <TokenMultiSender/>
        
    </div>
  </DefaultLayout>
  </>
  )
}

export default page