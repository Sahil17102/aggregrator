import { extendTheme } from "@chakra-ui/react";
import { CardComponent } from "./additions/card/Card";
import { CardBodyComponent } from "./additions/card/CardBody";
import { CardHeaderComponent } from "./additions/card/CardHeader";
import { MainPanelComponent } from "./additions/layout/mainPanel";
import { PanelContainerComponent } from "./additions/layout/panelContainer";
import { PanelContentComponent } from "./additions/layout/panelContent";
import { badgeStyles } from "./components/badge";
import { buttonStyles } from "./components/button";
import { drawerStyles } from "./components/drawer";
import { linkStyles } from "./components/link";
import { brandFonts, brandGradients } from "./brand";
import { breakpoints } from "./foundations/breakpoints";
import { globalStyles } from "./styles";

const fieldBase = {
  borderRadius: "8px",
  borderColor: "#E2E8F0",
  bg: "#FFFFFF",
  fontWeight: "500",
  fontSize: "16px",
  _placeholder: {
    color: "gray.500",
  },
  _hover: {
    borderColor: "#CBD5E1",
  },
  _focusVisible: {
    borderColor: "brand.500",
    boxShadow: "0 0 0 3px rgba(108, 92, 231, 0.18)",
    bg: "#FFFFFF",
  },
  _dark: {
    bg: "#161B22",
    borderColor: "#30363D",
    color: "#E6EDF3",
    _placeholder: {
      color: "#6E7681",
    },
    _hover: {
      borderColor: "#3f4652",
    },
    _focusVisible: {
      borderColor: "#6C5CE7",
      boxShadow: "0 0 0 3px rgba(108, 92, 231, 0.22)",
      bg: "#161B22",
    },
  },
};

const dividerStyles = {
  components: {
    Divider: {
      baseStyle: {
        borderColor: "rgba(13,27,77,0.1)",
        borderWidth: "1px",
      },
      defaultProps: {
        variant: "subtle",
      },
    },
  },
};

const componentOverrides = {
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  components: {
    Input: {
      variants: {
        outline: {
          field: fieldBase,
        },
        filled: {
          field: {
            ...fieldBase,
            bg: "rgba(255,248,240,0.92)",
          },
        },
      },
      defaultProps: {
        focusBorderColor: "accent.500",
        variant: "outline",
      },
    },
    Select: {
      variants: {
        outline: {
          field: fieldBase,
        },
      },
      defaultProps: {
        focusBorderColor: "accent.500",
        variant: "outline",
      },
    },
    Textarea: {
      variants: {
        outline: {
          ...fieldBase,
          minH: "120px",
        },
      },
      defaultProps: {
        focusBorderColor: "accent.500",
        variant: "outline",
      },
    },
    FormLabel: {
      baseStyle: {
        fontSize: "12px",
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        fontWeight: "800",
        color: "gray.600",
        mb: "10px",
        _dark: {
          color: "#8B949E",
        },
      },
    },
    Menu: {
      baseStyle: {
        list: {
          bg: "#FFFFFF",
          color: "#0F172A",
          borderColor: "#E2E8F0",
          boxShadow: "0 18px 42px rgba(15, 23, 42, 0.14)",
          _dark: {
            bg: "#161B22",
            color: "#E6EDF3",
            borderColor: "#30363D",
            boxShadow: "0 24px 54px rgba(0, 0, 0, 0.34)",
          },
        },
        item: {
          bg: "transparent",
          color: "#0F172A",
          _hover: {
            bg: "#F9FAFB",
          },
          _focus: {
            bg: "#F9FAFB",
          },
          _dark: {
            color: "#E6EDF3",
            _hover: {
              bg: "#21262D",
            },
            _focus: {
              bg: "#21262D",
            },
          },
        },
      },
    },
    Table: {
      variants: {
        simple: {
          table: {
            borderCollapse: "separate",
            borderSpacing: "0",
          },
          thead: {
            tr: {
              th: {
                textTransform: "uppercase",
                letterSpacing: "0",
                fontWeight: "800",
                fontSize: "14px",
                color: "#93A0BA",
                borderColor: "#E2E8F0",
                bg: "#F4F1FF",
                py: "17px",
                _dark: {
                  color: "#8B949E",
                  borderColor: "#30363D",
                  bg: "#1a2234",
                },
              },
            },
          },
          tbody: {
            tr: {
              td: {
                bg: "#FFFFFF",
                borderColor: "#E2E8F0",
                fontSize: "17px",
                color: "#0F172A",
                py: "18px",
                _dark: {
                  bg: "#161B22",
                  borderColor: "#30363D",
                  color: "#E6EDF3",
                },
              },
            },
          },
        },
      },
    },
    Tabs: {
      baseStyle: {
        tab: {
          borderRadius: "10px",
          px: "18px",
          py: "10px",
          fontWeight: "700",
          color: "gray.600",
          _dark: {
            color: "#8B949E",
          },
          _selected: {
            color: "gray.900",
            bg: "rgba(255,255,255,0.78)",
            boxShadow: "0 12px 28px rgba(68,92,138,0.1)",
            _dark: {
              color: "#E6EDF3",
              bg: "#21262D",
              boxShadow: "none",
            },
          },
        },
        tablist: {
          p: "6px",
          borderRadius: "12px",
          bg: "rgba(255,255,255,0.72)",
          border: "1px solid rgba(13,27,77,0.08)",
          boxShadow: "0 14px 28px rgba(68,92,138,0.06)",
          _dark: {
            bg: "#161B22",
            borderColor: "#30363D",
            boxShadow: "none",
          },
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          borderRadius: "16px",
          borderWidth: "1px",
          borderColor: "rgba(13,27,77,0.12)",
          boxShadow: "0 34px 72px rgba(13,27,77,0.18)",
          bg: brandGradients.surface,
          overflow: "hidden",
          backdropFilter: "blur(16px)",
          _dark: {
            bg: "#161B22",
            borderColor: "#30363D",
            boxShadow: "0 34px 72px rgba(0, 0, 0, 0.42)",
          },
        },
        header: {
          fontWeight: "800",
          fontFamily: brandFonts.display,
          borderBottom: "1px solid rgba(13,27,77,0.08)",
          pb: "18px",
          _dark: {
            borderColor: "#30363D",
            color: "#E6EDF3",
          },
        },
        body: {
          py: "20px",
          _dark: {
            color: "#E6EDF3",
          },
        },
        footer: {
          borderTop: "1px solid rgba(13,27,77,0.08)",
          pt: "18px",
          _dark: {
            borderColor: "#30363D",
          },
        },
        overlay: {
          bg: "rgba(20, 25, 35, 0.5)",
          backdropFilter: "blur(10px)",
        },
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: "8px",
        textTransform: "none",
        px: "2.5",
        py: "1",
        fontWeight: "700",
      },
    },
    Tooltip: {
      baseStyle: {
        borderRadius: "12px",
      },
    },
  },
  fonts: {
    heading: brandFonts.display,
    body: brandFonts.body,
  },
};

export default extendTheme(
  { breakpoints },
  globalStyles,
  buttonStyles,
  badgeStyles,
  linkStyles,
  drawerStyles,
  CardComponent,
  CardBodyComponent,
  CardHeaderComponent,
  MainPanelComponent,
  PanelContentComponent,
  PanelContainerComponent,
  dividerStyles,
  componentOverrides
);
