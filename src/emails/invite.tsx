/** @jsxImportSource react */
import * as React from "react";

import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import type { Group } from "~/database";
import { applicationName } from "~/app-config";

const BASE_URL = import.meta.env.BASE_URL;

export function InviteEmail({ group, token }: { group: Group; token: string }) {
  const previewText = `You're been invited to a group!`;
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <React.Fragment>
          <Body className="bg-white my-auto mx-auto font-sans">
            <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
              <Section className="mt-[32px]">
                <Img
                  src={`${BASE_URL}/group.jpeg`}
                  width="160"
                  height="48"
                  alt="StarterKit"
                  className="my-0 mx-auto"
                />
              </Section>

              <Section className="text-center mt-[32px] mb-[32px]">
                <Text className="text-black font-medium text-[14px] leading-[24px] mb-8">
                  You&apos; been invited to a group on Serby.xyz called{" "}
                  {group.name}. Click the link below to login and access your
                  group.
                </Text>

                <Text className="text-black font-medium text-[14px] leading-[24px]">
                  <Link
                    href={`${BASE_URL}/invites/${token}`}
                    target="_blank"
                    className="text-[#2754C5] underline"
                  >
                    Login to View Group
                  </Link>
                </Text>
              </Section>

              <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full " />

              <Text className="text-[#666666] text-[12px] leading-[24px] flex items-center justify-center">
                © 2024 {applicationName}. All rights reserved.
              </Text>
            </Container>
          </Body>
        </React.Fragment>
      </Tailwind>
    </Html>
  );
}
