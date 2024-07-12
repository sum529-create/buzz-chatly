import {
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { auth } from "../firebase";

const BtnWrapper = styled.div`
  margin-top: 25px;
  border-top: 1px solid #dfe6e9;
  padding-top: 25px;
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.5rem;
`;

const Button = styled.span`
  background-color: #fff;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 50px;
  border: 0;
  color: #000;
  width: 100%;
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const Logo = styled.img`
  height: 25px;
`;

export default function ExternalLogin() {
  const navigate = useNavigate();
  const onClick = async (e: string) => {
    try {
      if (e === "github") {
        const provider = new GithubAuthProvider();
        await signInWithPopup(auth, provider); // popup창 오픈
        // await signInWithRedirect(auth, provider) // page 이동
      } else if (e === "google") {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      }
      navigate("/");
    } catch (error) {
      console.error("error occur", error);
    }
  };
  return (
    <BtnWrapper>
      <Button onClick={() => onClick("google")}>
        <Logo src="/images/google-logo.svg" />
        Continue with Google
      </Button>
      <Button onClick={() => onClick("github")}>
        <Logo src="/images/github-logo.svg" />
        Continue with Github
      </Button>
    </BtnWrapper>
  );
}
