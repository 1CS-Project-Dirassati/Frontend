"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import styles from "./style.module.css";

export default function SignInSelection() {
  const router = useRouter();
  const authToken = useSelector((state) => state.auth.accessToken);
  const role = useSelector((state) => state.auth.role);

  useEffect(() => {
    if (authToken) {
      router.push(`/${role}`);
    }
  }, [authToken, role, router]);

  const handleNavigation = (role) => {
    router.push(`/signin/${role}`);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Sign In As</h1>
      <div className={styles.buttonGroup}>
        <button
          className={styles.button}
          onClick={() => handleNavigation("parent")}
        >
          Parent
        </button>
        <button
          className={styles.button}
          onClick={() => handleNavigation("teacher")}
        >
          Teacher
        </button>
        <button
          className={styles.button}
          onClick={() => handleNavigation("student")}
        >
          Student
        </button>
      </div>
    </div>
  );
}
