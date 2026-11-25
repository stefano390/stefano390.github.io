import React from "react";
import { navigate } from "./store";
export const useRouter = () => ({ push: navigate });
export default function Link({ scroll, prefetch, onNavigate, href, ...props }) {
  return <a href="#historial" {...props} onClick={event => {
    event.preventDefault();
    onNavigate?.();
    navigate(href);
  }} />;
}
