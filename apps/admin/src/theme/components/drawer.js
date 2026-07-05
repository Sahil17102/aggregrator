export const drawerStyles = {
  components: {
    Drawer: {
      // 3. We can add a new visual variant
      variants: {
        "with-shadow": (props) => ({
          placement: "right",
          boxShadow:
            props.colorMode === "dark"
              ? "0 24px 54px rgba(0, 0, 0, 0.34)"
              : "0 0 2px 2px rgba(51, 51, 105, 0.1)",
          bgColor: props.colorMode === "dark" ? "#161B22" : "white",
          color: props.colorMode === "dark" ? "#E6EDF3" : "#0F172A",
        }),
      },
    },
  },
};
