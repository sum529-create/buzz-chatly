import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  Wrapper,
  Title,
  Form,
  Input,
  Error,
  Switcher,
} from "../components/auth-component";
import ExternalLogin from "../components/external-login";

export default function Login() {
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [state, setState] = useState({
    email: "",
    password: "",
    error: "",
  });

  const { email, password, error } = state;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setState((preVal) => ({
      ...preVal,
      [name]: value,
    }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState((preVal) => ({
      ...preVal,
      error: "",
    }));
    if (isLoading || email === "" || password === "") {
      return;
    }
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);

      // 유저 정보 업데이트 하기

      // 홈페이지로 리다이렉트
      navigate("/");
    } catch (e: any) {
      if (e instanceof FirebaseError) {
        let errorMessage = "";
        switch (e.code) {
          case "auth/user-not-found":
            errorMessage =
              "해당 이메일로 등록된 사용자를 찾을 수 없습니다. 이메일을 확인해주세요.";
            break;
          case "auth/wrong-password":
            errorMessage = "비밀번호가 틀렸습니다. 다시 시도해주세요.";
            break;
          case "auth/invalid-email":
            errorMessage =
              "유효하지 않은 이메일 주소입니다. 올바른 이메일 주소를 입력해주세요.";
            break;
          case "auth/user-disabled":
            errorMessage =
              "해당 사용자는 비활성화되었습니다. 관리자에게 문의해주세요.";
            break;
          default:
            errorMessage =
              "알 수 없는 오류가 발생했습니다. 나중에 다시 시도해주세요.";
        }
        setState((preVal) => ({
          ...preVal,
          error: errorMessage,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Title>Buzz Chatly</Title>
      <Form onSubmit={onSubmit}>
        <Input
          name="email"
          value={email}
          onChange={handleChange}
          placeholder="이메일"
          type="email"
          required
        />
        <Input
          name="password"
          value={password}
          onChange={handleChange}
          placeholder="비밀번호"
          type="password"
          required
        />
        <Input type="submit" value={isLoading ? "Loading..." : "로그인"} />
      </Form>
      {error !== "" ? <Error>{error}</Error> : null}
      <Switcher>
        비밀번호를 잊으셨나요?
        <Link to="/pw-inquiry">비밀번호 찾기 &rarr;</Link>
      </Switcher>
      <Switcher>
        계정이 없으신가요? <Link to="/create-account">가입하기 &rarr;</Link>
      </Switcher>
      <ExternalLogin />
    </Wrapper>
  );
}
