"use client";

import React from "react";
import { ImageKitProvider, IKImage } from "imagekitio-next";
import { SessionProvider } from "next-auth/react";

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;
const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;

export default function Providers({ children }: { children: React.ReactNode }) {
  const authenticator = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/imagekit-auth");

      if (!res.ok) {
        throw new Error("Error authenticating ImageKit");
      }

      return res.json();
    } catch (error) {
      console.error("Error authenticating ImageKit:", error);
      throw error;
    }
  };

  return (
    <SessionProvider refetchInterval={5*60}>
      <ImageKitProvider
        urlEndpoint={urlEndpoint}
        publicKey={publicKey}
        authenticator={authenticator}
      >
        {children}
      </ImageKitProvider>
    </SessionProvider>
  );
}
