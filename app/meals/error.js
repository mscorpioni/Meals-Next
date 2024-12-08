"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="error">
      <h1>An Error occured!</h1>
      <p>Please, try again later.</p>
    </main>
  );
}
