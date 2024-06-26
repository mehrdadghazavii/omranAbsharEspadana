import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { faIR } from "@mui/material/locale";
import { connect } from "react-redux";
import React from "react";

interface themeProps {
  dark: string;
  children: any;
  fontSize: number;
  borderRadius: number;
  fontFamily: string;
}

function Theme({ dark, children, fontSize, borderRadius, fontFamily }: themeProps) {
  const theme = createTheme(
      {
        shape: {
          borderRadius,
        },
        breakpoints: {
          values: {
            xs: 0,
            sm: 768,
            md: 1024,
            lg: 1330,
            xl: 1600,
          },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                "&::-webkit-scrollbar-thumb, & ::-webkit-scrollbar-thumb": {
                  borderRadius,
                  backgroundColor: dark ? `rgb(107, 107, 107)` : "#fafafa",
                  minHeight: 24,
                  border: `3px solid ${dark ? "rgb(43, 43, 43)" : "#afafaf"}`,
                },
                "&::-webkit-scrollbar, & ::-webkit-scrollbar": {
                  backgroundColor: dark ? `rgb(43, 43, 43)` : "rgba(0, 0, 0, 0.25)",
                },
              },
            },
          },
          MuiIconButton: {
            styleOverrides: {
              root: {
                borderRadius,
              },
            },
          },
        },
        direction: "rtl",
        typography: {
          fontSize,
          fontFamily: [fontFamily].join(","),
        },
        palette: {
          primary: {
            // main: '#3A0BA1',
            // light: '#6728ED',
            // dark: '#1D0354',x
            main: dark ? "#151E31" : "#01999d",
            light: dark ? "#DEE5E5" : "#DEE5E5",
            dark: dark ? "#EAB805" : "#333B4B",
            // contrastText: dark ? 'rgba(0,0,0,.87)' : undefined
          },
          secondary: {
            main: dark ? "#ce93d8" : "#0093B9",
            light: dark ? "#f3e5f5" : "#577399",
            dark: dark ? "#ab47bc" : "#98DFAF",
            contrastText: dark ? "rgba(0,0,0,.87)" : undefined,
          },
          // text: {
          //   primary: dark ? '#fff' : 'rgba(0,0,0,.87)',
          //   secondary: dark ? 'rgba(255,255,255,.7)' : 'rgba(0,0,0,.6)',
          //   disabled: dark ? 'rgba(255,255,255,.5)' : 'rgba(0,0,0,.38)',
          //   // icon: dark ? 'rgba(255,255,255,.5)' : '',
          // },
          background: {
            default: dark ? "rgb(55, 55, 55)" : "rgba(55, 119, 188,0.050980392156862744)",
          },
          mode: dark ? "dark" : "light",
        },
      },
      faIR
  );

  return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
  );
}

const mapStateToProps = (state: any) => {
  return {
    dark: state.dark,
    fontSize: state.fontSize,
    borderRadius: state.borderRadius,
    fontFamily: state.fontFamily,
  };
};

const reduxTheme = connect(mapStateToProps)(Theme);

export { reduxTheme as Theme };
