import React from "react";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import NativeMultiSender from "@/components/NativeMultiTSender";

function page() {
  return (
    <>
      <DefaultLayout>
        <div className=" h-[100vh]">
          {/* <SendTransaction/> */}
          <NativeMultiSender />
        </div>
      </DefaultLayout>
    </>
  );
}

export default page;
