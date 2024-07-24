import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./routes/home";
import Layout from "./components/layout";
import Login from "./routes/login";
import Profile from "./routes/profile";
import CreateAccount from "./routes/create-account";
import styled, { createGlobalStyle } from "styled-components";
import reset from "styled-reset";
import { useEffect, useState } from "react";
import LoadingScreen from "./components/loading-screen";
import { auth } from "./firebase";
import ProtectedRoute from "./components/protected-route";
import PwInquiry from "./routes/pw-inquiry";
import Info from "./routes/info";

const GlobalStyles = createGlobalStyle`
  ${reset};
  *{
    box-sizing: border-box;
  }
  body{
    background-color:#000;
    color: #FFF;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    word-break: keep-all;
  }
`;

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/create-account",
    element: <CreateAccount />,
  },
  {
    path: "pw-inquiry",
    element: <PwInquiry />,
  },
  {
    path: "/info",
    element: <Info />,
  },
]);

const Wrapper = styled.div`
  /* height: 100vh; */
  display: flex;
  justify-content: center;
  width: 48rem; // 768px
  margin: 0 auto;
  background-color: #1e272e;
  position: relative;
  flex-direction: column;
  min-height: 100vh;
  @media (max-width: 768px) {
    width: auto;
  }
`;

function App() {
  const [isLoading, setLoading] = useState(true);
  const init = async () => {
    await auth.authStateReady();
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };
  useEffect(() => {
    init();
  }, []);
  return (
    <Wrapper>
      <GlobalStyles />
      {isLoading ? <LoadingScreen /> : <RouterProvider router={router} />}
    </Wrapper>
  );
}

export default App;
