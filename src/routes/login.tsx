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
    console.log(email, name, password);
    if (isLoading || email === "" || password === "") {
      return;
    }
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      //   console.log(credentials.user);

      // 유저 정보 업데이트 하기

      // 홈페이지로 리다이렉트
      navigate("/");
    } catch (e: any) {
      if (e instanceof FirebaseError) {
        setState((preVal) => ({
          ...preVal,
          error: e.message,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Title>Buzz 로그인</Title>
      <Form onSubmit={onSubmit}>
        <Input
          name="email"
          value={email}
          onChange={handleChange}
          placeholder="Email"
          type="email"
          required
        />
        <Input
          name="password"
          value={password}
          onChange={handleChange}
          placeholder="Password"
          type="password"
          required
        />
        <Input type="submit" value={isLoading ? "Loading..." : "로그인"} />
      </Form>
      {error !== "" ? <Error>{error}</Error> : null}
      <Switcher>
        비밀번호를 잃어버리셨나요?
        <Link to="/pw-inquiry">비밀번호 찾기 &rarr;</Link>
      </Switcher>
      <Switcher>
        계정이 없으신가요? <Link to="/create-account">회원가입 &rarr;</Link>
      </Switcher>
      <ExternalLogin />
    </Wrapper>
  );
}
