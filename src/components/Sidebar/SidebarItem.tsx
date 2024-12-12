import React from "react";
import Link from "next/link";
import SidebarDropdown from "@/components/Sidebar/SidebarDropdown";
import { usePathname } from "next/navigation";

const SidebarItem = ({ item, pageName, setPageName,isCollapsed,  }: any) => {
  const handleClick = () => {
    const updatedPageName =
      pageName !== item.label.toLowerCase() ? item.label.toLowerCase() : "";
      
    return setPageName(updatedPageName);
    
  };

  const pathname = usePathname();

  const isActive = (item: any) => {
    if (item.route === pathname) return true;
    if (item.children) {
      return item.children.some((child: any) => isActive(child));
    }
    return false;
  };
  const isExternalUrl = (url: string) =>
    url.startsWith("http://") || url.startsWith("https://");
  const isItemActive = isActive(item);

  return (
    <>
       <li>
        {isExternalUrl(item.route) ? (
          <a
            href={item.route}
            target="_blank"
            rel="noopener noreferrer"
            className={`${isItemActive ? "bg-graydark dark:bg-meta-4 bg-active text-[#000] mx-3 " : ""} group relative flex items-center ${
              isCollapsed ? "flex-col text-2xl" : ""
            } gap-2.5 rounded-sm px-4 py-2 mx-3 font-semibold text-base text-bodydark1 duration-300 ease-in-out hover:text-green-400`}
          >
            {item.icon}
            {!isCollapsed && item.label}
          </a>
        ) : (
          <Link
            href={item.route}
            onClick={handleClick}
            className={`${isItemActive ? "bg-graydark dark:bg-meta-4 bg-active text-[#000] mx-3 " : ""} group relative flex items-center ${
              isCollapsed ? "flex-col text-2xl" : ""
            } gap-2.5 rounded-sm px-4 py-2 mx-3 font-semibold text-base text-bodydark1 duration-300 ease-in-out hover:text-green-400`}
          >
            {item.icon}
            {!isCollapsed && item.label}
            {item.children && !isCollapsed && ( // Hide SVG icon if sidebar is collapsed
              <svg
                className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                  pageName === item.label.toLowerCase() && "rotate-180"
                }`}
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                  fill=""
                />
              </svg>
            )}
          </Link>
        )}

        {item.children && (
          <div
            className={`translate transform overflow-hidden ${
              pageName !== item.label.toLowerCase() && "hidden"
            }`}
          >
            <SidebarDropdown item={item.children} isCollapsed={isCollapsed} />
          </div>
        )}
      </li>
    </>
  );
};

export default SidebarItem;
