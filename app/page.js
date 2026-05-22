"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const user = localStorage.getItem("lu_user");
    router.replace(user ? "/dashboard" : "/login");
  }, [router]);
  return null;
}
