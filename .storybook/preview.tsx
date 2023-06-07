import { Inter } from "next/font/google";
import React from "react";
import type { Preview } from "@storybook/react";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className={inter.className}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
