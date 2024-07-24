import {
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  // signInWithRedirect,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { auth } from "../firebase";

const BreakLineWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  position: relative;
  padding: 2rem;
  width: 100%;
`;

const BreakLine = styled.div`
  background-color: #999;
  flex-grow: 1;
  position: relative;
  height: 1px;
  flex-shrink: 1;
  width: 100%;
`;

const BreakText = styled.div`
  margin: 0 18px;
`;

const BtnWrapper = styled.div`
  display: flex;
  width: 100%;
  gap: 0.5rem;
  justify-content: center;
`;

const Button = styled.span`
  background-color: #fff;
  font-weight: 500;
  padding: 10px;
  border-radius: 50px;
  color: #000;
  width: 50px;
  text-align: center;
  border: 2px solid #fff;
  /* width: 100%;
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center; */
  cursor: pointer;
  &:hover {
    border-color: #05c46b;
  }
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
    <>
      <BreakLineWrapper>
        <BreakLine />
        <BreakText>또는</BreakText>
        <BreakLine />
      </BreakLineWrapper>
      <BtnWrapper>
        <Button onClick={() => onClick("google")}>
          <Logo src="/images/google-logo.svg" />
        </Button>
        <Button onClick={() => onClick("github")}>
          <Logo src="/images/github-logo.svg" />
        </Button>
      </BtnWrapper>
    </>
  );
}
