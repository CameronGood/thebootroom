"use client";

import NextLink from "next/link";
import { ComponentProps } from "react";

export default function Link({
  href,
  children,
  ...props
}: ComponentProps<typeof NextLink>) {
  return (
    <NextLink href={href} prefetch={false} {...props}>
      {children}
    </NextLink>
  );
}

