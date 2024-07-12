import {
  GithubAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { auth } from "../firebase";

const Button = styled.span`
  background-color: #fff;
  font-weight: 500;
  margin-top: 50px;
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

export default function GithubBtn() {
  const navigate = useNavigate();
  const onClick = async () => {
    try {
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider); // popup창 오픈
      // await signInWithRedirect(auth, provider) // page 이동
      navigate("/");
    } catch (error) {
      console.error("error occur", error);
    }
  };
  return (
    <Button onClick={() => onClick}>
      <Logo src="/images/github-logo.svg" />
      Continue with Github
    </Button>
  );
}
