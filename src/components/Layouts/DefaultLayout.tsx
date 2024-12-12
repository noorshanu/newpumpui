"use client";
import React, { useState, ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Footer } from "../Footer";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Handle mouse enter and leave to toggle the sidebar
  const handleMouseEnter = () => setIsCollapsed(false);
  const handleMouseLeave = () => setIsCollapsed(true);

  return (
    <>
      {/* Page Wrapper Start */}
      <div className=" ">
        <div id="stars"></div>
      </div>
      <div className="flex">
        {/* Sidebar Start */}
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`transition-[width] duration-500 ease-in-out ${
            isCollapsed ? " w-0 sm:w-22" : "w-[14.05rem]"
          }`}
        >
          <Sidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
        </div>
        {/* Sidebar End */}

        {/* Content Area Start */}
        <div
          className={`relative flex  flex-1 flex-col transition-[margin-left] duration-500 ease-in-out ${
            isCollapsed ? "lg:ml-0" : "lg:ml-[0rem]"
          }`}
        >
          {/* Header Start */}
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          {/* Header End */}

          {/* Main Content Start */}
          <main>
            <div className="mx-auto max-w-full p-2 md:p-4 2xl:p-2">
              {children}
            </div>
            <Footer />
          </main>
          {/* Main Content End */}
        </div>
        {/* Content Area End */}
      </div>
      {/* Page Wrapper End */}
    </>
  );
}