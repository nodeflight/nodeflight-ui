import { red } from "@material-ui/core/colors";
import { createMuiTheme } from "@material-ui/core/styles";

const palette = ["#272932", "#0f7173", "#f05d5e", "#e7ecef", "#d8a47f"];

const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      main: palette[1],
    },
    secondary: {
      main: palette[2],
    },
    error: {
      main: "#f00",
    },
    background: {
      default: palette[0],
    },
  },
});

export default theme;
