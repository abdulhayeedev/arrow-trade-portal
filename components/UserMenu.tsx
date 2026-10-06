"use client";

import { useState, useRef, useEffect } from "react";
import { logout } from "@/app/auth/actions";

export default function UserMenu({
  displayName,
  companyName,
  initials,
  profileHref,
  extraHref,
  extraLabel,
}: {
  displayName: string;
  companyName: string;
  initials: string;
  profileHref: string;
  extraHref?: string;
  extraLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF4438]">
          <span className="font-heading text-xs font-bold text-white">{initials}</span>
        </div>
        <span className="text-[13.5px] font-semibold text-[#14171F]">
          {displayName} <span className="text-[#9AA2B1]">·</span> {companyName}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9AA2B1"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] w-48 overflow-hidden rounded-xl border border-[#E5E5E7] bg-white py-1.5 shadow-[0_14px_32px_rgba(20,23,31,0.14)]">
          <a
            href={profileHref}
            className="block px-4 py-2.5 text-sm font-medium text-[#14171F] hover:bg-[#FAFAFB]"
          >
            My profile
          </a>
          {extraHref && extraLabel && (
            <a
              href={extraHref}
              className="block px-4 py-2.5 text-sm font-medium text-[#14171F] hover:bg-[#FAFAFB]"
            >
              {extraLabel}
            </a>
          )}
          <form action={logout}>
            <button
              type="submit"
              className="block w-full px-4 py-2.5 text-left text-sm font-medium text-[#14171F] hover:bg-[#FAFAFB]"
            >
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}