import { Outlet } from "react-router-dom";
import BuzzChatlyHeader from "./header";

export default function Layout() {
  return (
    <>
      <BuzzChatlyHeader />
      <Outlet />
    </>
  );
}
