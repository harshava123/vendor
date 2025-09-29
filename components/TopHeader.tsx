"use client"
import { BellIcon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export function TopHeader() {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("token", { path: "/" });
    try {
      localStorage.removeItem("token");
    } catch {}
    router.push("/login");
  };

  return (
    <div className="bg-[#262626] border-b border-gray-200 px-6 py-3 flex justify-end items-center">
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <BellIcon className="h-6 w-6 text-white" />
          <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center -ml-2 -mt-3">
            1
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="cursor-pointer text-lg text-white hover:bg-white/10"
            onClick={handleLogout}
          >
            <LogOut className="h-6 w-6 text-white" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
