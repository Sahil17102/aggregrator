import { mode } from "@chakra-ui/theme-tools";
import { brandFonts } from "./brand";
import colors from "./foundations/colors";

export const globalStyles = {
  colors: {
    ...colors,
  },
  styles: {
    global: (props) => ({
      body: {
        bg: mode("#FAFBFE", "#0D1117")(props),
        color: mode("#0F172A", "#E6EDF3")(props),
        colorScheme: props.colorMode,
        fontFamily: brandFonts.body,
        fontSize: "16px",
        backgroundImage: "none",
        backgroundAttachment: "fixed",
      },
      html: {
        fontFamily: brandFonts.body,
        bg: mode("#FAFBFE", "#0D1117")(props),
      },
      "#root": {
        minHeight: "100vh",
      },
      "*": {
        boxSizing: "border-box",
        letterSpacing: "0",
      },
      ".chakra-button": {
        borderRadius: "8px !important",
        minHeight: "40px",
        alignItems: "center",
        justifyContent: "center",
      },
      ".chakra-icon-button": {
        borderRadius: "8px !important",
      },
      ".admin-card": {
        borderRadius: "12px !important",
      },
      ".chakra-modal__content": {
        borderRadius: "16px !important",
      },
      ".chakra-input, .chakra-select, .chakra-textarea": {
        borderRadius: "8px !important",
      },
      ".chakra-select option": {
        background: mode("#FFFFFF", "#161B22")(props),
        color: mode("#0F172A", "#E6EDF3")(props),
      },
      ".chakra-ui-dark .admin-card, .chakra-ui-dark .chakra-card, .chakra-ui-dark .chakra-modal__content, .chakra-ui-dark .chakra-popover__content, .chakra-ui-dark .chakra-menu__menu-list, .chakra-ui-dark .chakra-drawer__content": {
        background: "#161B22 !important",
        backgroundColor: "#161B22 !important",
        color: "#E6EDF3 !important",
        borderColor: "#30363D !important",
        boxShadow: "none !important",
      },
      ".chakra-ui-dark .chakra-table, .chakra-ui-dark .chakra-table__container": {
        background: "#0D1117 !important",
        color: "#E6EDF3 !important",
        borderColor: "#30363D !important",
      },
      ".chakra-ui-dark .chakra-table th": {
        background: "#1A2234 !important",
        color: "#B7C2D0 !important",
        borderColor: "#30363D !important",
      },
      ".chakra-ui-dark .chakra-table td, .chakra-ui-dark .chakra-table tr": {
        background: "#161B22 !important",
        color: "#E6EDF3 !important",
        borderColor: "#30363D !important",
      },
      ".chakra-ui-dark .chakra-input, .chakra-ui-dark .chakra-select, .chakra-ui-dark .chakra-textarea": {
        background: "#161B22 !important",
        color: "#E6EDF3 !important",
        borderColor: "#30363D !important",
      },
      ".chakra-ui-dark .chakra-input::placeholder, .chakra-ui-dark .chakra-textarea::placeholder": {
        color: "#6E7681 !important",
      },
      ".chakra-ui-dark .chakra-form__label, .chakra-ui-dark .chakra-form__helper-text": {
        color: "#8B949E !important",
      },
      ".chakra-ui-dark .chakra-tabs__tablist": {
        background: "#161B22 !important",
        borderColor: "#30363D !important",
        boxShadow: "none !important",
      },
      ".chakra-ui-dark .chakra-tabs__tab": {
        color: "#8B949E !important",
      },
      ".chakra-ui-dark .chakra-tabs__tab[aria-selected=true]": {
        background: "#21262D !important",
        color: "#E6EDF3 !important",
      },
      ".chakra-ui-dark .chakra-divider": {
        borderColor: "#30363D !important",
      },
      ".chakra-ui-dark .chakra-button:not([data-theme-keep])": {
        borderColor: "#30363D",
      },
      ".chakra-ui-dark .chakra-button[data-variant=outline], .chakra-ui-dark .chakra-button[data-variant=ghost]": {
        color: "#E6EDF3 !important",
      },
      "::selection": {
        background: mode("brand.100", "accent.600")(props),
      },
      "::-webkit-scrollbar": {
        width: "10px",
        height: "10px",
      },
      "::-webkit-scrollbar-track": {
        background: mode("#FAFBFE", "#0D1117")(props),
      },
      "::-webkit-scrollbar-thumb": {
        background: "rgba(139, 148, 158, 0.65)",
        borderRadius: "999px",
      },
    }),
  },
};
